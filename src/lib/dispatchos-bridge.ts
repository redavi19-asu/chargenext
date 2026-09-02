"use client";

type DispatchOSEmergencyRecord = {
  requestId: string;
  stripeSessionId: string;
  paymentStatus: string;
  verifiedPhone: string;
  requestTimestamp: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
    label?: string;
    source?: "gps" | "manual";
  };
};

type DispatchOSSyncResult = {
  ok: boolean;
  skipped?: boolean;
  status?: number;
};

const DISPATCHOS_INTAKE_URL = process.env.NEXT_PUBLIC_DISPATCHOS_INTAKE_URL?.trim();

/**
 * Best-effort bridge from a verified ChargeNext emergency request into DispatchOS.
 *
 * The browser never contains a DispatchOS secret. The configured intake URL must
 * point to a server-side/public-intake endpoint that performs its own validation,
 * tenant resolution and rate limiting before creating a DispatchOS job.
 *
 * Until that endpoint is configured, this function safely does nothing so the
 * current ChargeNext customer flow keeps working exactly as it does today.
 */
export async function syncVerifiedEmergencyRequestToDispatchOS(
  record: DispatchOSEmergencyRecord
): Promise<DispatchOSSyncResult> {
  if (!DISPATCHOS_INTAKE_URL || typeof window === "undefined") {
    return { ok: false, skipped: true };
  }

  const payload = {
    source: "chargenext",
    companySlug: "chargenext",
    externalRequestId: record.requestId,
    customerPhone: record.verifiedPhone,
    paymentStatus: record.paymentStatus,
    stripeSessionId: record.stripeSessionId,
    requestedAt: record.requestTimestamp,
    jobType: "Emergency EV Charging",
    priority: "emergency",
    location: {
      latitude: record.location.lat,
      longitude: record.location.lng,
      accuracy: record.location.accuracy ?? null,
      address: record.location.address ?? record.location.label ?? null,
      source: record.location.source ?? "gps",
    },
  };

  try {
    const response = await fetch(DISPATCHOS_INTAKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!response.ok) {
      console.warn("ChargeNext DispatchOS sync failed", response.status);
      return { ok: false, status: response.status };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    console.warn("ChargeNext DispatchOS sync unavailable", error);
    return { ok: false };
  }
}
