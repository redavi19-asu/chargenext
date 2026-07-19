"use client";

import { useEffect, useState } from "react";
import { MapPin, MessageCircle, Phone, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { CHARGENEXT_URLS } from "@/lib/constants";
import { confirmEmergencyVerificationCode, sendEmergencyVerificationCode } from "@/lib/emergency-api";
import {
  buildEmergencyMapsEmbedUrl,
  buildEmergencyMapsUrl,
  formatEmergencyCoordinates,
  getEmergencyLocationLabel,
  saveDetectedEmergencyLocation,
  saveVerifiedEmergencyRequest,
  saveVerificationRequestId,
  type EmergencyLocation,
  type EmergencyVerificationRecord,
} from "@/lib/emergency-flow";

type EmergencyVerificationModalProps = {
  isOpen: boolean;
  stripeSessionId: string;
  requestTimestamp: string;
  initialLocation: EmergencyLocation | null;
  paymentStatus: string;
  onClose: () => void;
  onVerified: (record: EmergencyVerificationRecord) => void;
};

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "").trim();
}

export function EmergencyVerificationModal({
  isOpen,
  stripeSessionId,
  requestTimestamp,
  initialLocation,
  paymentStatus,
  onClose,
  onVerified,
}: EmergencyVerificationModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationRequestId, setVerificationRequestId] = useState("");
  const [location, setLocation] = useState<EmergencyLocation | null>(initialLocation);
  const [manualLat, setManualLat] = useState(initialLocation ? String(initialLocation.lat) : "");
  const [manualLng, setManualLng] = useState(initialLocation ? String(initialLocation.lng) : "");
  const [manualAddress, setManualAddress] = useState(initialLocation?.address ?? "");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      setManualLat(String(initialLocation.lat));
      setManualLng(String(initialLocation.lng));
      setManualAddress(initialLocation.address ?? "");
      saveDetectedEmergencyLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleUseCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: EmergencyLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "gps",
        };

        setLocation(nextLocation);
        setManualLat(String(nextLocation.lat));
        setManualLng(String(nextLocation.lng));
        setManualAddress("");
        setIsEditingLocation(false);
        saveDetectedEmergencyLocation(nextLocation);
      },
      () => {
        setError("Unable to refresh your current location. You can still correct the pin manually.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSaveCorrectedLocation = () => {
    const lat = Number(manualLat);
    const lng = Number(manualLng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Enter valid latitude and longitude values before saving the correction.");
      return;
    }

    const correctedLocation: EmergencyLocation = {
      lat,
      lng,
      address: manualAddress.trim() || undefined,
      label: manualAddress.trim() || undefined,
      source: "manual",
    };

    setLocation(correctedLocation);
    saveDetectedEmergencyLocation(correctedLocation);
    setIsEditingLocation(false);
    setError("");
  };

  const handleSendVerificationCode = async () => {
    const nextPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (!nextPhoneNumber) {
      setError("Enter a phone number before sending the verification code.");
      return;
    }

    if (!location) {
      setError("Confirm your location before sending the code.");
      return;
    }

    setIsSendingCode(true);
    setError("");

    try {
      const response = await sendEmergencyVerificationCode({
        sessionId: stripeSessionId,
        phoneNumber: nextPhoneNumber,
        location,
      });

      const nextVerificationRequestId = response.verificationRequestId || response.requestId || stripeSessionId;
      setVerificationRequestId(nextVerificationRequestId);
      saveVerificationRequestId(nextVerificationRequestId);
      setStatusMessage(response.message || `Verification code sent to ${nextPhoneNumber}.`);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send the verification code.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationRequestId) {
      setError("Send the verification code first.");
      return;
    }

    if (!verificationCode.trim()) {
      setError("Enter the verification code text message before continuing.");
      return;
    }

    setIsVerifyingCode(true);
    setError("");

    try {
      const response = await confirmEmergencyVerificationCode({
        verificationRequestId,
        code: verificationCode.trim(),
      });

      if (!response.verified) {
        throw new Error("The verification code was not accepted.");
      }

      const verifiedRecord: EmergencyVerificationRecord = {
        requestId: response.requestId || verificationRequestId,
        stripeSessionId: response.stripeSessionId || stripeSessionId,
        paymentStatus: response.paymentStatus || paymentStatus || "paid",
        verifiedPhone: normalizePhoneNumber(phoneNumber),
        location: response.location || location || {
          lat: 0,
          lng: 0,
          source: "manual",
        },
        requestTimestamp: response.requestTimestamp || requestTimestamp,
        verificationRequestId,
        providerStatus: response.providerStatus || "Locating provider",
        estimatedArrivalMinutes: response.estimatedArrivalMinutes ?? null,
        statusUpdatedAt: response.statusUpdatedAt || new Date().toISOString(),
      };

      saveVerifiedEmergencyRequest(verifiedRecord);
      setStatusMessage("Your emergency request has been verified. A charging provider is being located now.");
      onVerified(verifiedRecord);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify the code.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const embedUrl = buildEmergencyMapsEmbedUrl(location);
  const mapsUrl = buildEmergencyMapsUrl(location);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      layout="fixed-header-footer"
      closeOnBackdrop={true}
      closeOnEscape={true}
      showCloseButton={true}
    >
      <ModalHeader onClose={onClose} showCloseButton={true}>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-100 p-2">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Received</h2>
            <p className="text-sm text-slate-500">Verify your location and phone number</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          <p className="text-base text-slate-600 leading-relaxed">
            Your payment has been received. Before we dispatch a charging provider, please confirm your phone number and emergency location.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Customer Details */}
            <div className="space-y-6">
              {/* Phone Number */}
              <div>
                <label htmlFor="phone-number" className="mb-2 block text-sm font-semibold text-slate-900">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  disabled={isVerifyingCode || isSendingCode}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Location Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900">
                    <MapPin className="mr-2 inline h-4 w-4" />
                    Emergency Location
                  </label>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Detected Location</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{getEmergencyLocationLabel(location)}</p>
                    <p className="mt-1 text-xs text-slate-600">{formatEmergencyCoordinates(location)}</p>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
                  >
                    <MapPin className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleUseCurrentLocation}
                    variant="secondary"
                    className="rounded-xl h-12 text-sm font-medium"
                    disabled={isSendingCode || isVerifyingCode}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Location
                  </Button>
                  <Button
                    onClick={() => setIsEditingLocation(!isEditingLocation)}
                    variant="secondary"
                    className="rounded-xl h-12 text-sm font-medium"
                    disabled={isSendingCode || isVerifyingCode}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Correct Location
                  </Button>
                </div>

                {isEditingLocation && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase">Latitude</label>
                        <input
                          type="text"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          disabled={isVerifyingCode || isSendingCode}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase">Longitude</label>
                        <input
                          type="text"
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                          disabled={isVerifyingCode || isSendingCode}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase">Address or Landmark</label>
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        disabled={isVerifyingCode || isSendingCode}
                        placeholder="Parking lot entrance, building 2A, etc."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveCorrectedLocation}
                        className="flex-1 rounded-lg h-10 text-sm font-medium"
                        disabled={isSendingCode || isVerifyingCode}
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setIsEditingLocation(false)}
                        variant="secondary"
                        className="flex-1 rounded-lg h-10 text-sm font-medium"
                        disabled={isSendingCode || isVerifyingCode}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Verification & Map */}
            <div className="space-y-6">
              {/* Map Preview */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  <MapPin className="mr-2 inline h-4 w-4" />
                  Location Preview
                </label>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    src={embedUrl}
                    title="Emergency location map"
                    className="h-64 w-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Verification Code */}
              <div className="space-y-3">
                <label htmlFor="verification-code" className="block text-sm font-semibold text-slate-900">
                  <MessageCircle className="mr-2 inline h-4 w-4" />
                  Verification Code
                </label>
                <input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  disabled={isVerifyingCode || isSendingCode}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-center text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
                <p className="text-xs text-slate-500">Enter the 6-digit code sent to your phone</p>
              </div>

              {/* Payment Status Card */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700 uppercase">Payment Status</p>
                <p className="mt-2 text-sm font-semibold text-emerald-900">{paymentStatus || "Received & Confirmed"}</p>
                <p className="mt-1 text-xs text-emerald-800">Timestamp: {new Date(requestTimestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {statusMessage && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-sm text-sky-900">{statusMessage}</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-medium text-rose-900">Error</p>
              <p className="mt-1 text-sm text-rose-800">{error}</p>
            </div>
          )}

          {/* WhatsApp Support */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <a
              href={CHARGENEXT_URLS.whatsappEmergency}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              <MessageCircle className="h-4 w-4" />
              Need help? Contact support on WhatsApp
            </a>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col gap-3 sm:flex-row">
          {!verificationRequestId ? (
            <Button
              onClick={handleSendVerificationCode}
              disabled={isSendingCode || isVerifyingCode}
              className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
            >
              {isSendingCode ? (
                <>
                  <ShieldCheck className="h-5 w-5 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5 mr-2" />
                  Confirm Location & Send Code
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleVerifyCode}
              disabled={isVerifyingCode || isSendingCode}
              className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
            >
              {isVerifyingCode ? (
                <>
                  <ShieldCheck className="h-5 w-5 mr-2 animate-pulse" />
                  Verifying...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Verify & Request Dispatch
                </>
              )}
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
