"use client";

import { useEffect, useState } from "react";
import { MapPin, MessageCircle, Phone, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
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
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Received — Verify Your Emergency Location">
      <div className="max-h-[78vh] space-y-5 overflow-y-auto pr-1">
        <p className="text-sm leading-6 text-slate-600">
          Your payment has been received. Before we dispatch a charging provider, please confirm your phone number and emergency location.
        </p>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200 bg-slate-50/80">
            <CardContent className="space-y-4 p-4">
              <div>
                <label htmlFor="phone-number" className="mb-2 block text-sm font-medium text-slate-800">
                  Phone number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleUseCurrentLocation} variant="secondary" className="rounded-xl px-4 py-3 text-sm">
                  <RefreshCw className="h-4 w-4" />
                  Use My Current Location
                </Button>
                <Button
                  onClick={() => setIsEditingLocation((current) => !current)}
                  variant="secondary"
                  className="rounded-xl px-4 py-3 text-sm"
                >
                  <MapPin className="h-4 w-4" />
                  Correct Map Location
                </Button>
              </div>

              {isEditingLocation ? (
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Latitude</label>
                      <input
                        type="text"
                        value={manualLat}
                        onChange={(event) => setManualLat(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Longitude</label>
                      <input
                        type="text"
                        value={manualLng}
                        onChange={(event) => setManualLng(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Readable address or landmark</label>
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={(event) => setManualAddress(event.target.value)}
                      placeholder="Apartment entrance, parking lot, nearby landmark"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSaveCorrectedLocation} className="rounded-xl px-4 py-3 text-sm">
                      Save Corrected Location
                    </Button>
                    <Button onClick={() => setIsEditingLocation(false)} variant="secondary" className="rounded-xl px-4 py-3 text-sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Emergency location</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{getEmergencyLocationLabel(location)}</p>
                <p className="mt-1 text-sm text-slate-600">{formatEmergencyCoordinates(location)}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-600"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Maps
                </a>
              </div>

              <Button onClick={handleSendVerificationCode} disabled={isSendingCode} className="w-full rounded-xl px-4 py-3 text-sm">
                {isSendingCode ? (
                  <>
                    <ShieldCheck className="h-4 w-4 animate-pulse" />
                    Sending SMS Code...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    Confirm Location &amp; Send Verification Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  src={embedUrl}
                  title="Customer emergency location map"
                  className="h-64 w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div>
                <label htmlFor="verification-code" className="mb-2 block text-sm font-medium text-slate-800">
                  Verification code
                </label>
                <input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  placeholder="Enter the SMS code"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <Button onClick={handleVerifyCode} disabled={isVerifyingCode} className="w-full rounded-xl px-4 py-3 text-sm">
                {isVerifyingCode ? (
                  <>
                    <ShieldCheck className="h-4 w-4 animate-pulse" />
                    Verifying Request...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Verify &amp; Request Dispatch
                  </>
                )}
              </Button>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Payment status</p>
                <p className="mt-1">{paymentStatus || "paid"}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Request timestamp</p>
                <p className="mt-1 text-sm text-slate-900">{requestTimestamp}</p>
              </div>

              {statusMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  {statusMessage}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  {error}
                </div>
              ) : null}

              <a
                href={CHARGENEXT_URLS.whatsappEmergency}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                <Phone className="h-4 w-4" />
                Emergency WhatsApp support remains available.
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Modal>
  );
}