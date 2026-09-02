"use client";

import type { EmergencyLocation } from "@/lib/emergency-flow";

const API_BASE = process.env.NEXT_PUBLIC_CHARGENEXT_API_BASE || "https://chargenext-api.ryanedavis.workers.dev";

// Keep the Stripe integration in place, but prevent customer checkout until launch.
const PAYMENTS_ENABLED = false;

type JsonRecord = Record<string, unknown>;

async function postJson<T>(path: string, body: JsonRecord) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

async function getJson<T>(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function serializeLocation(location: EmergencyLocation | null) {
  if (!location) {
    return null;
  }

  return {
    lat: location.lat,
    lng: location.lng,
    accuracy: location.accuracy ?? null,
    address: location.address ?? null,
    label: location.label ?? null,
    source: location.source ?? "gps",
  };
}

export async function createEmergencyCheckoutSession(params: {
  successUrl: string;
  cancelUrl: string;
  location: EmergencyLocation | null;
  tier?: string;
  amount?: number;
  metadata?: Record<string, string>;
}) {
  if (!PAYMENTS_ENABLED) {
    throw new Error("Online payments are coming soon. No payment was created.");
  }

  return postJson<{ url?: string; session_id?: string; id?: string }>("/checkout", {
    tier: params.tier || "Emergency Boost",
    amount: params.amount ?? 59,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    return_url: params.successUrl,
    location: serializeLocation(params.location),
    metadata: params.metadata || {},
  });
}

export async function verifyEmergencyCheckoutSession(sessionId: string) {
  return postJson<{
    verified: boolean;
    paymentStatus?: string;
    stripeSessionId?: string;
    requestId?: string;
    requestTimestamp?: string;
    location?: EmergencyLocation | null;
  }>("/checkout/verify", {
    session_id: sessionId,
  });
}

export async function sendEmergencyVerificationCode(params: {
  sessionId: string;
  phoneNumber: string;
  location: EmergencyLocation | null;
}) {
  return postJson<{
    verificationRequestId?: string;
    requestId?: string;
    message?: string;
  }>("/verification/start", {
    stripe_session_id: params.sessionId,
    phone_number: params.phoneNumber,
    location: serializeLocation(params.location),
    channel: "sms",
  });
}

export async function confirmEmergencyVerificationCode(params: {
  verificationRequestId: string;
  code: string;
}) {
  return postJson<{
    verified: boolean;
    requestId?: string;
    stripeSessionId?: string;
    paymentStatus?: string;
    verifiedPhone?: string;
    location?: EmergencyLocation | null;
    requestTimestamp?: string;
    providerStatus?: string;
    estimatedArrivalMinutes?: number | null;
    providerName?: string;
    vehicleName?: string;
    providerPhone?: string;
    trackingStage?: "assigned" | "en-route" | "arrived" | "charging" | "completed";
    trackingProgress?: number;
    distanceRemainingMiles?: number | null;
    cancelAllowed?: boolean;
    statusUpdatedAt?: string;
  }>("/verification/confirm", {
    verification_request_id: params.verificationRequestId,
    code: params.code,
  });
}

export async function verifyStripeCheckoutSession(sessionId: string) {
  return getJson<{
    valid?: boolean;
    paid?: boolean;
    paymentStatus?: string;
    status?: string;
    sessionId?: string;
    stripeSessionId?: string;
    requestId?: string;
    requestTimestamp?: string;
    location?: EmergencyLocation | null;
    message?: string;
  }>(`/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
}

export async function sendCustomerVerificationCode(params: {
  sessionId: string;
  phone: string;
  lat: number;
  lng: number;
}) {
  return postJson<{
    ok?: boolean;
    verificationRequestId?: string;
    requestId?: string;
    message?: string;
  }>("/customer-verification/send", {
    sessionId: params.sessionId,
    phone: params.phone,
    lat: params.lat,
    lng: params.lng,
  });
}

export async function confirmCustomerVerificationCode(params: {
  sessionId: string;
  phone: string;
  code: string;
  lat: number;
  lng: number;
}) {
  return postJson<{
    ok?: boolean;
    verified?: boolean;
    requestId?: string;
    stripeSessionId?: string;
    paymentStatus?: string;
    requestTimestamp?: string;
    providerStatus?: string;
    estimatedArrivalMinutes?: number | null;
    location?: EmergencyLocation | null;
    message?: string;
  }>("/customer-verification/confirm", {
    sessionId: params.sessionId,
    phone: params.phone,
    code: params.code,
    lat: params.lat,
    lng: params.lng,
  });
}

export async function fetchEmergencyRequestStatus(requestId: string) {
  return getJson<{
    requestId: string;
    providerStatus?: string;
    providerName?: string;
    vehicleName?: string;
    providerPhone?: string;
    trackingStage?: "assigned" | "en-route" | "arrived" | "charging" | "completed";
    trackingProgress?: number;
    distanceRemainingMiles?: number | null;
    cancelAllowed?: boolean;
    estimatedArrivalMinutes?: number | null;
    paymentStatus?: string;
    verifiedPhone?: string;
    location?: EmergencyLocation | null;
    requestTimestamp?: string;
    statusUpdatedAt?: string;
  }>(`/requests/${encodeURIComponent(requestId)}/status`);
}
