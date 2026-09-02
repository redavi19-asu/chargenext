"use client";

import { syncVerifiedEmergencyRequestToDispatchOS } from "@/lib/dispatchos-bridge";

export type EmergencyLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  label?: string;
  source?: "gps" | "manual";
};

export type ProviderTrackingStage = "assigned" | "en-route" | "arrived" | "charging" | "completed";

export type EmergencyCheckoutDraft = {
  location: EmergencyLocation | null;
  capturedAt: string;
};

export type EmergencyVerificationRecord = {
  requestId: string;
  stripeSessionId: string;
  paymentStatus: string;
  verifiedPhone: string;
  location: EmergencyLocation;
  requestTimestamp: string;
  verificationRequestId?: string;
  providerStatus?: string;
  providerName?: string;
  vehicleName?: string;
  providerPhone?: string;
  trackingStage?: ProviderTrackingStage;
  trackingProgress?: number;
  trackingStartedAt?: string;
  refreshCount?: number;
  distanceRemainingMiles?: number | null;
  cancelAllowed?: boolean;
  estimatedArrivalMinutes?: number | null;
  statusUpdatedAt?: string;
};

export type PendingPaymentVerificationStep = "location" | "payment" | "code";

export type PendingPaymentVerificationState = {
  stripeSessionId: string;
  phoneNumber: string;
  latitude: number | null;
  longitude: number | null;
  smsSent: boolean;
  currentStep: PendingPaymentVerificationStep;
  paymentVerificationStatus: "pending" | "sms-sent" | "verified" | "invalid";
  requestTimestamp: string;
  isMinimized: boolean;
  locationAddress?: string;
  locationLabel?: string;
  trackingRecord?: EmergencyVerificationRecord | null;
  updatedAt: string;
};

const STORAGE_KEYS = {
  draft: "chargenext:emergency:draft",
  checkoutSessionId: "chargenext:emergency:checkout-session-id",
  verificationRequestId: "chargenext:emergency:verification-request-id",
  verificationRecord: "chargenext:emergency:verification-record",
  pendingVerification: "chargenext:emergency:pending-payment-verification",
} as const;

function readSessionStorageValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key);
}

function writeSessionStorageValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, value);
}

function removeSessionStorageValue(key: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
}

function readLocalStorageValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeLocalStorageValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function removeLocalStorageValue(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function saveEmergencyCheckoutDraft(location: EmergencyLocation | null) {
  const draft: EmergencyCheckoutDraft = {
    location,
    capturedAt: new Date().toISOString(),
  };
  writeSessionStorageValue(STORAGE_KEYS.draft, JSON.stringify(draft));
}

export function readEmergencyCheckoutDraft() {
  return parseJson<EmergencyCheckoutDraft>(readSessionStorageValue(STORAGE_KEYS.draft));
}

export function clearEmergencyCheckoutDraft() {
  removeSessionStorageValue(STORAGE_KEYS.draft);
}

export function saveCheckoutSessionId(sessionId: string) {
  if (!sessionId) return;
  writeSessionStorageValue(STORAGE_KEYS.checkoutSessionId, sessionId);
}

export function readCheckoutSessionId() {
  return readSessionStorageValue(STORAGE_KEYS.checkoutSessionId) || null;
}

export function saveVerificationRequestId(requestId: string) {
  if (!requestId) return;
  writeSessionStorageValue(STORAGE_KEYS.verificationRequestId, requestId);
}

export function readVerificationRequestId() {
  return readSessionStorageValue(STORAGE_KEYS.verificationRequestId) || null;
}

export function saveVerifiedEmergencyRequest(record: EmergencyVerificationRecord) {
  // Keep the verified tracking record available after a browser restart on the
  // same device. Checkout/payment verification data remains session-scoped.
  writeLocalStorageValue(STORAGE_KEYS.verificationRecord, JSON.stringify(record));
  void syncVerifiedEmergencyRequestToDispatchOS(record);
}

export function readVerifiedEmergencyRequest() {
  return parseJson<EmergencyVerificationRecord>(readLocalStorageValue(STORAGE_KEYS.verificationRecord));
}

export function clearVerifiedEmergencyRequest() {
  removeLocalStorageValue(STORAGE_KEYS.verificationRecord);
}

export function saveDetectedEmergencyLocation(location: EmergencyLocation | null) {
  saveEmergencyCheckoutDraft(location);
}

export function clearDetectedEmergencyLocation() {
  clearEmergencyCheckoutDraft();
}

export function formatEmergencyCoordinates(location: EmergencyLocation | null) {
  if (!location) return "Location unavailable";
  const latDirection = location.lat >= 0 ? "N" : "S";
  const lngDirection = location.lng >= 0 ? "E" : "W";
  return `${Math.abs(location.lat).toFixed(6)}°${latDirection}, ${Math.abs(location.lng).toFixed(6)}°${lngDirection}`;
}

export function buildEmergencyMapsUrl(location: EmergencyLocation | null) {
  if (!location) return "https://www.google.com/maps";
  const query = `${location.lat},${location.lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}

export function buildEmergencyMapsEmbedUrl(location: EmergencyLocation | null) {
  if (!location) return "https://www.google.com/maps?output=embed&q=Washington%2C%20DC";
  return `https://www.google.com/maps?output=embed&q=${location.lat},${location.lng}`;
}

export function getEmergencyLocationLabel(location: EmergencyLocation | null) {
  if (!location) return "Awaiting GPS confirmation";
  return location.address || location.label || formatEmergencyCoordinates(location);
}

export function readPendingPaymentVerificationState() {
  return parseJson<PendingPaymentVerificationState>(readSessionStorageValue(STORAGE_KEYS.pendingVerification));
}

export function savePendingPaymentVerificationState(state: PendingPaymentVerificationState) {
  writeSessionStorageValue(STORAGE_KEYS.pendingVerification, JSON.stringify({
    ...state,
    updatedAt: new Date().toISOString(),
  }));
}

export function updatePendingPaymentVerificationState(
  patch: Partial<PendingPaymentVerificationState>
) {
  const current = readPendingPaymentVerificationState();
  if (!current) return null;
  const nextState = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  } satisfies PendingPaymentVerificationState;
  savePendingPaymentVerificationState(nextState);
  return nextState;
}

export function clearPendingPaymentVerificationState() {
  removeSessionStorageValue(STORAGE_KEYS.pendingVerification);
}
