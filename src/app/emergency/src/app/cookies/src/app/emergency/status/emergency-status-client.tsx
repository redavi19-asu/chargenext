"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, MessageCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHARGENEXT_URLS } from "@/lib/constants";
import { fetchEmergencyRequestStatus } from "@/lib/emergency-api";
import {
  buildEmergencyMapsEmbedUrl,
  formatEmergencyCoordinates,
  getEmergencyLocationLabel,
  readVerifiedEmergencyRequest,
  saveVerifiedEmergencyRequest,
  type EmergencyVerificationRecord,
} from "@/lib/emergency-flow";

export default function EmergencyStatusClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedRecord = readVerifiedEmergencyRequest();
  const requestIdFromUrl = searchParams.get("requestId") || savedRecord?.requestId || savedRecord?.stripeSessionId || "";
  const savedRecordRef = useRef(savedRecord);
  const [record, setRecord] = useState<EmergencyVerificationRecord | null>(savedRecord);
  const [statusMessage, setStatusMessage] = useState(
    savedRecord ? "Showing the latest verified request saved on this device." : "Loading your verified emergency request..."
  );
  const [error, setError] = useState(requestIdFromUrl ? "" : "No verified emergency request was found on this device.");

  useEffect(() => {
    if (!requestIdFromUrl) {
      return;
    }

    let isMounted = true;

    const loadStatus = async () => {
      try {
        const response = await fetchEmergencyRequestStatus(requestIdFromUrl);
        const existingRecord = savedRecordRef.current;
        const nextRecord: EmergencyVerificationRecord = {
          requestId: response.requestId,
          stripeSessionId: existingRecord?.stripeSessionId || requestIdFromUrl,
          paymentStatus: response.paymentStatus || existingRecord?.paymentStatus || "paid",
          verifiedPhone: response.verifiedPhone || existingRecord?.verifiedPhone || "",
          location: response.location || existingRecord?.location || {
            lat: 0,
            lng: 0,
            source: "manual",
          },
          requestTimestamp: response.requestTimestamp || existingRecord?.requestTimestamp || new Date().toISOString(),
          providerStatus: response.providerStatus || existingRecord?.providerStatus || "Provider assignment pending",
          estimatedArrivalMinutes: response.estimatedArrivalMinutes ?? existingRecord?.estimatedArrivalMinutes ?? null,
          statusUpdatedAt: response.statusUpdatedAt || new Date().toISOString(),
        };

        if (!isMounted) {
          return;
        }

        setRecord(nextRecord);
        saveVerifiedEmergencyRequest(nextRecord);
        setStatusMessage("Your emergency request has been verified. A charging provider is being located now.");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        if (savedRecordRef.current) {
          setStatusMessage("Showing the latest verified request saved on this device.");
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "Unable to load the latest request status.");
      }
    };

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [requestIdFromUrl]);

  const embedUrl = buildEmergencyMapsEmbedUrl(record?.location ?? null);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),linear-gradient(180deg,_#0f172a,_#020617_52%,_#f8fafc_52%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl pt-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <Card className="border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Request status</p>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Emergency request tracking</h1>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-600">{statusMessage}</p>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">{error}</div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{record ? "Verified" : "Pending"}</p>
                  <p className="mt-1 text-sm text-slate-600">{record?.paymentStatus || "Awaiting payment confirmation"}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provider assignment</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{record?.providerStatus || "Finding the closest charging provider"}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {typeof record?.estimatedArrivalMinutes === "number"
                      ? `Estimated arrival in about ${record.estimatedArrivalMinutes} minutes`
                      : "Estimated arrival time will appear when a provider accepts."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verified emergency location</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{getEmergencyLocationLabel(record?.location ?? null)}</p>
                <p className="mt-1 text-sm text-slate-600">{formatEmergencyCoordinates(record?.location ?? null)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Request details</p>
                <p className="mt-2 text-sm text-slate-700">Stripe session: {record?.stripeSessionId || "Pending"}</p>
                <p className="mt-1 text-sm text-slate-700">Verified phone: {record?.verifiedPhone || "Pending"}</p>
                <p className="mt-1 text-sm text-slate-700">Requested at: {record?.requestTimestamp || "Pending"}</p>
                {record?.statusUpdatedAt ? <p className="mt-1 text-sm text-slate-700">Updated at: {record.statusUpdatedAt}</p> : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => router.refresh()} className="service-cta service-cta--yellow-ring rounded-xl px-5 py-3 text-sm">
                  Refresh Status
                </Button>
                <Button variant="secondary" onClick={() => router.push("/")} className="service-cta service-cta--yellow-ring rounded-xl px-5 py-3 text-sm">
                  Return Home
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(CHARGENEXT_URLS.whatsappEmergency, "_blank", "noopener,noreferrer")}
                  className="service-cta service-cta--yellow-ring rounded-xl px-5 py-3 text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Support
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <MapPin className="mr-2 inline h-4 w-4" />
              Live location map
            </div>
            <iframe
              src={embedUrl}
              title="Verified emergency location map"
              className="h-[560px] w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </div>
      </div>
    </main>
  );
}