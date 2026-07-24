"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MapPin, MessageCircle, Minus, Phone, RefreshCw, ShieldCheck, Smartphone, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { CHARGENEXT_URLS } from "@/lib/constants";
import { confirmCustomerVerificationCode, sendCustomerVerificationCode } from "@/lib/emergency-api";
import {
  buildEmergencyMapsEmbedUrl,
  buildEmergencyMapsUrl,
  formatEmergencyCoordinates,
  getEmergencyLocationLabel,
  saveDetectedEmergencyLocation,
  saveVerifiedEmergencyRequest,
  type EmergencyLocation,
  type EmergencyVerificationRecord,
  type PendingPaymentVerificationState,
  type PendingPaymentVerificationStep,
} from "@/lib/emergency-flow";

const ProviderTrackingDashboard = dynamic(
  () => import("@/components/provider-tracking-dashboard").then((module) => module.ProviderTrackingDashboard),
  { ssr: false }
);

type PaymentVerificationModalProps = {
  isOpen: boolean;
  stripeSessionId: string;
  requestTimestamp: string;
  initialLocation: EmergencyLocation | null;
  paymentStatus?: string;
  pendingState: PendingPaymentVerificationState | null;
  onMinimize: () => void;
  onStateChange: (state: PendingPaymentVerificationState) => void;
  onVerified: (record: EmergencyVerificationRecord) => void;
};

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "").trim();
}

function normalizePaymentVerificationStatus(status?: string | null): PendingPaymentVerificationState["paymentVerificationStatus"] {
  if (status === "pending" || status === "sms-sent" || status === "verified" || status === "invalid") {
    return status;
  }

  return "pending";
}

function createStateFromInputs(params: {
  stripeSessionId: string;
  requestTimestamp: string;
  location: EmergencyLocation | null;
  pendingState: PendingPaymentVerificationState | null;
  paymentStatus?: string;
}): PendingPaymentVerificationState {
  const { stripeSessionId, requestTimestamp, location, pendingState, paymentStatus } = params;

  return {
    stripeSessionId,
    phoneNumber: pendingState?.phoneNumber || "",
    latitude: pendingState?.latitude ?? location?.lat ?? null,
    longitude: pendingState?.longitude ?? location?.lng ?? null,
    smsSent: pendingState?.smsSent || false,
    currentStep: pendingState?.currentStep || "location",
    paymentVerificationStatus: pendingState?.paymentVerificationStatus || normalizePaymentVerificationStatus(paymentStatus),
    requestTimestamp: pendingState?.requestTimestamp || requestTimestamp,
    isMinimized: pendingState?.isMinimized || false,
    locationAddress: pendingState?.locationAddress || location?.address || undefined,
    locationLabel: pendingState?.locationLabel || location?.label || undefined,
    updatedAt: new Date().toISOString(),
  };
}

export function PaymentVerificationModal({
  isOpen,
  stripeSessionId,
  requestTimestamp,
  initialLocation,
  paymentStatus,
  pendingState,
  onMinimize,
  onStateChange,
  onVerified,
}: PaymentVerificationModalProps) {
  const derivedState = useMemo(
    () =>
      createStateFromInputs({
        stripeSessionId,
        requestTimestamp,
        location: initialLocation,
        pendingState,
      }),
    [initialLocation, pendingState, requestTimestamp, stripeSessionId]
  );

  const [phoneNumber, setPhoneNumber] = useState(derivedState.phoneNumber);
  const [verificationCode, setVerificationCode] = useState("");
  const [location, setLocation] = useState<EmergencyLocation | null>(initialLocation || null);
  const [manualLat, setManualLat] = useState(initialLocation ? String(initialLocation.lat) : "");
  const [manualLng, setManualLng] = useState(initialLocation ? String(initialLocation.lng) : "");
  const [manualAddress, setManualAddress] = useState(initialLocation?.address ?? "");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState<PendingPaymentVerificationStep>(derivedState.currentStep);
  const [smsSent, setSmsSent] = useState(derivedState.smsSent);
  const [paymentVerificationStatus, setPaymentVerificationStatus] = useState(derivedState.paymentVerificationStatus);
  const [trackingRecord, setTrackingRecord] = useState<EmergencyVerificationRecord | null>(pendingState?.trackingRecord ?? null);
  const [statusMessage, setStatusMessage] = useState(
    "Your payment was received. Before a charging provider is dispatched, confirm your phone number and emergency location."
  );
  const [error, setError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  useEffect(() => {
    setPhoneNumber(derivedState.phoneNumber);
    setLocation(initialLocation || null);
    setManualLat(initialLocation ? String(initialLocation.lat) : "");
    setManualLng(initialLocation ? String(initialLocation.lng) : "");
    setManualAddress(initialLocation?.address ?? "");
    setCurrentStep(derivedState.currentStep);
    setSmsSent(derivedState.smsSent);
    setPaymentVerificationStatus(derivedState.paymentVerificationStatus);
    setTrackingRecord(derivedState.paymentVerificationStatus === "verified" ? pendingState?.trackingRecord ?? null : pendingState?.trackingRecord ?? null);
    setStatusMessage(
      derivedState.smsSent
        ? "A verification code was sent. Enter it to continue to dispatch."
        : "Your payment was received. Before a charging provider is dispatched, confirm your phone number and emergency location."
    );

    if (initialLocation) {
      saveDetectedEmergencyLocation(initialLocation);
    }
  }, [derivedState, initialLocation, pendingState]);

  const persistState = (nextState: PendingPaymentVerificationState) => {
    onStateChange(nextState);
    setPaymentVerificationStatus(nextState.paymentVerificationStatus);
  };

  const syncLocation = (nextLocation: EmergencyLocation | null) => {
    setLocation(nextLocation);
    if (nextLocation) {
      setManualLat(String(nextLocation.lat));
      setManualLng(String(nextLocation.lng));
      setManualAddress(nextLocation.address ?? nextLocation.label ?? "");
      saveDetectedEmergencyLocation(nextLocation);
    }
  };

  const buildNextState = (patch: Partial<PendingPaymentVerificationState>): PendingPaymentVerificationState => ({
    ...createStateFromInputs({
      stripeSessionId,
      requestTimestamp,
      paymentStatus,
      location,
      pendingState,
    }),
    ...patch,
    updatedAt: new Date().toISOString(),
  });

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

        syncLocation(nextLocation);
        persistState(
          buildNextState({
            latitude: nextLocation.lat,
            longitude: nextLocation.lng,
            locationAddress: nextLocation.address,
            locationLabel: nextLocation.label,
            currentStep: smsSent ? "code" : "location",
            paymentVerificationStatus,
          })
        );
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

    syncLocation(correctedLocation);
    persistState(
      buildNextState({
        latitude: lat,
        longitude: lng,
        locationAddress: correctedLocation.address,
        locationLabel: correctedLocation.label,
        currentStep: smsSent ? "code" : "location",
        paymentVerificationStatus,
      })
    );
    setIsEditingLocation(false);
    setError("");
  };

  const handleSendVerificationCode = async () => {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone) {
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
      const response = await sendCustomerVerificationCode({
        sessionId: stripeSessionId,
        phone: normalizedPhone,
        lat: location.lat,
        lng: location.lng,
      });

      const nextState = buildNextState({
        phoneNumber: normalizedPhone,
        latitude: location.lat,
        longitude: location.lng,
        smsSent: true,
        currentStep: "code",
        paymentVerificationStatus: "sms-sent",
        locationAddress: location.address,
        locationLabel: location.label,
      });

      persistState(nextState);
      setPhoneNumber(normalizedPhone);
      setSmsSent(true);
      setCurrentStep("code");
      setStatusMessage(response.message || `Verification code sent to ${normalizedPhone}.`);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send the verification code.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!smsSent) {
      setError("Send the verification code first.");
      return;
    }

    if (!verificationCode.trim()) {
      setError("Enter the verification code before continuing.");
      return;
    }

    if (!location) {
      setError("Confirm your location before verifying.");
      return;
    }

    setIsVerifyingCode(true);
    setError("");

    try {
      const response = await confirmCustomerVerificationCode({
        sessionId: stripeSessionId,
        phone: normalizedPhone,
        code: verificationCode.trim(),
        lat: location.lat,
        lng: location.lng,
      });

      if (!response.verified && !response.ok) {
        throw new Error(response.message || "The verification code was not accepted.");
      }

      const verifiedRecord: EmergencyVerificationRecord = {
        requestId: response.requestId || stripeSessionId,
        stripeSessionId: response.stripeSessionId || stripeSessionId,
        paymentStatus: response.paymentStatus || paymentStatus || "paid",
        verifiedPhone: normalizedPhone,
        location: response.location || location,
        requestTimestamp: response.requestTimestamp || requestTimestamp,
        verificationRequestId: stripeSessionId,
        providerStatus: response.providerStatus || "Assigned",
        estimatedArrivalMinutes: response.estimatedArrivalMinutes ?? null,
        providerName: response.providerStatus ? undefined : "Dispatch team",
        vehicleName: response.providerStatus ? undefined : `ChargeNext Truck #${String(Math.abs(stripeSessionId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 900 + 100)}`,
        providerPhone: "+12024252813",
        trackingStage: "assigned",
        trackingProgress: 0.12,
        trackingStartedAt: new Date().toISOString(),
        refreshCount: 0,
        distanceRemainingMiles: 7.5,
        cancelAllowed: true,
        statusUpdatedAt: new Date().toISOString(),
      };

      saveVerifiedEmergencyRequest(verifiedRecord);
      setTrackingRecord(verifiedRecord);
      persistState(
        buildNextState({
          paymentVerificationStatus: "verified",
          trackingRecord: verifiedRecord,
          currentStep: "code",
          smsSent: true,
        })
      );
      setPaymentVerificationStatus("verified");
      setStatusMessage("Your emergency request is verified. We are locating an available charging provider now.");
      onVerified(verifiedRecord);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify the code.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const mapsUrl = buildEmergencyMapsUrl(location);
  const embedUrl = buildEmergencyMapsEmbedUrl(location);

  if (trackingRecord) {
    const trackingLocation = trackingRecord.location || location;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onMinimize}
        size="large"
        layout="fixed-header-footer"
        closeOnBackdrop={false}
        closeOnEscape={false}
        showCloseButton={false}
      >
        <ModalHeader showCloseButton={false}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sky-100 p-2">
              <Truck className="h-6 w-6 text-sky-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Track Your Provider</h2>
              <p className="text-sm text-slate-500">Your payment and phone are verified</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onMinimize} className="rounded-xl px-3 py-2 text-sm flex-shrink-0">
            <Minus className="h-4 w-4" />
          </Button>
        </ModalHeader>

        <ModalBody>
          <ProviderTrackingDashboard
            requestId={trackingRecord.requestId || trackingRecord.stripeSessionId}
            customerLocation={trackingLocation}
            initialRecord={trackingRecord}
            onRecordChange={(nextRecord) => {
              setTrackingRecord(nextRecord);
              saveVerifiedEmergencyRequest(nextRecord);
              persistState(
                buildNextState({
                  paymentVerificationStatus: "verified",
                  trackingRecord: nextRecord,
                  smsSent: true,
                  currentStep: "code",
                })
              );
            }}
          />
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onMinimize}
      size="large"
      layout="fixed-header-footer"
      closeOnBackdrop={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <ModalHeader showCloseButton={false}>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-100 p-2">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Received</h2>
            <p className="text-sm text-slate-500">Verify your location and phone number</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onMinimize} className="rounded-xl px-3 py-2 text-sm flex-shrink-0">
          <Minus className="h-4 w-4" />
        </Button>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          <p className="text-base text-slate-600 leading-relaxed">
            Before a charging provider is dispatched, please confirm your phone number and emergency location.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Customer Details */}
            <div className="space-y-6">
              {/* Phone Number */}
              <div>
                <label htmlFor="payment-phone-number" className="mb-2 block text-sm font-semibold text-slate-900">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Phone Number
                </label>
                <input
                  id="payment-phone-number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(event) => {
                    const nextPhone = event.target.value;
                    setPhoneNumber(nextPhone);
                    persistState(
                      buildNextState({
                        phoneNumber: nextPhone,
                        currentStep,
                        smsSent,
                        paymentVerificationStatus,
                        latitude: location?.lat ?? null,
                        longitude: location?.lng ?? null,
                      })
                    );
                  }}
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
                    className="service-cta service-cta--yellow-ring rounded-xl h-12 text-sm font-medium"
                    disabled={isSendingCode || isVerifyingCode}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Location
                  </Button>
                  <Button
                    onClick={() => setIsEditingLocation(!isEditingLocation)}
                    variant="secondary"
                    className="service-cta service-cta--yellow-ring rounded-xl h-12 text-sm font-medium"
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
                        className="service-cta service-cta--yellow-ring flex-1 rounded-lg h-12 text-sm font-medium"
                        disabled={isSendingCode || isVerifyingCode}
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setIsEditingLocation(false)}
                        variant="secondary"
                        className="flex-1 rounded-lg h-12 text-sm font-medium"
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
              {/* Verification Code */}
              {smsSent && (
                <div className="space-y-3">
                  <label htmlFor="payment-verification-code" className="block text-sm font-semibold text-slate-900">
                    <MessageCircle className="mr-2 inline h-4 w-4" />
                    Verification Code
                  </label>
                  <input
                    id="payment-verification-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isVerifyingCode || isSendingCode}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-center text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                  <p className="text-xs text-slate-500">Enter the 6-digit code sent to your phone</p>
                </div>
              )}

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

              {/* Payment Status Card */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700 uppercase">Payment Status</p>
                <p className="mt-2 text-sm font-semibold text-emerald-900">Received & Confirmed</p>
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
          {!smsSent ? (
            <Button
              onClick={handleSendVerificationCode}
              disabled={isSendingCode || isVerifyingCode}
              className="service-cta service-cta--yellow-ring cta-btn--blue w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
            >
              {isSendingCode ? (
                <>
                  <ShieldCheck className="h-5 w-5 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleVerifyCode}
              disabled={isVerifyingCode || isSendingCode}
              className="service-cta service-cta--yellow-ring cta-btn--danger-dark w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
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
