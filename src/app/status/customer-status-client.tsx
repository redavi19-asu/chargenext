"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, MapPin, ShieldCheck, Smartphone, Truck } from "lucide-react";

import { fetchEmergencyRequestStatus } from "@/lib/emergency-api";
import {
  readVerifiedEmergencyRequest,
  saveVerifiedEmergencyRequest,
  type EmergencyVerificationRecord,
} from "@/lib/emergency-flow";

const ProviderTrackingDashboard = dynamic(
  () => import("@/components/provider-tracking-dashboard").then((module) => module.ProviderTrackingDashboard),
  { ssr: false }
);

const basePath = () => (process.env.NODE_ENV === "production" ? "/chargenext" : "");

function normalizeRecord(
  requestId: string,
  response: Awaited<ReturnType<typeof fetchEmergencyRequestStatus>>
): EmergencyVerificationRecord | null {
  if (!response.location) return null;

  return {
    requestId: response.requestId || requestId,
    stripeSessionId: "",
    paymentStatus: response.paymentStatus || "paid",
    verifiedPhone: response.verifiedPhone || "Verified customer",
    location: response.location,
    requestTimestamp: response.requestTimestamp || new Date().toISOString(),
    providerStatus: response.providerStatus || "Awaiting Dispatch",
    providerName: response.providerName,
    vehicleName: response.vehicleName,
    providerPhone: response.providerPhone,
    trackingStage: response.trackingStage || "assigned",
    trackingProgress: response.trackingProgress,
    distanceRemainingMiles: response.distanceRemainingMiles,
    cancelAllowed: response.cancelAllowed,
    estimatedArrivalMinutes: response.estimatedArrivalMinutes,
    statusUpdatedAt: response.statusUpdatedAt || new Date().toISOString(),
  };
}

export default function CustomerStatusClient() {
  const searchParams = useSearchParams();
  const requestId = useMemo(() => (searchParams.get("request_id") || "").trim(), [searchParams]);
  const [record, setRecord] = useState<EmergencyVerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestId) {
      setError("This tracking link is missing its ChargeNext request number.");
      setLoading(false);
      return;
    }

    const saved = readVerifiedEmergencyRequest();
    if (saved && (saved.requestId === requestId || saved.stripeSessionId === requestId)) {
      setRecord(saved);
      setLoading(false);
      return;
    }

    let mounted = true;

    const recoverTracking = async () => {
      try {
        const response = await fetchEmergencyRequestStatus(requestId);
        if (!mounted) return;
        const recovered = normalizeRecord(requestId, response);
        if (!recovered) {
          throw new Error("Your service request was found, but its tracking location is not available yet.");
        }
        saveVerifiedEmergencyRequest(recovered);
        setRecord(recovered);
      } catch (statusError) {
        if (!mounted) return;
        setError(statusError instanceof Error ? statusError.message : "Unable to load this ChargeNext request.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void recoverTracking();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 text-cyan-100">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your live ChargeNext service...
          </div>
        </div>
      </main>
    );
  }

  if (!record || error) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-10 text-white">
        <div className="mx-auto max-w-3xl pt-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl">
            <ShieldCheck className="h-9 w-9 text-cyan-300" />
            <h1 className="mt-5 text-3xl font-bold">ChargeNext Customer Tracking</h1>
            <p className="mt-3 text-white/60">{error || "We could not open this service request."}</p>
            <p className="mt-4 text-sm leading-6 text-white/45">
              Emergency customers do not need a DispatchOS login. Tracking stays inside ChargeNext while DispatchOS runs the operation behind the scenes.
            </p>
            <Link href={`${basePath()}/`} className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">
              Return to ChargeNext
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_35%),linear-gradient(180deg,_#030712,_#071525_42%,_#eef6fb_42%,_#f8fafc_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="pb-8 pt-5 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300">ChargeNext Live Service</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your charging provider is being coordinated now.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                This page is your customer view. ChargeNext handles your request here while the dispatch team operates through DispatchOS behind the scenes.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Payment + phone verified</div>
              <p className="mt-1 text-xs text-emerald-100/65">Request {record.requestId}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Service", "Emergency EV Charge", Truck],
              ["Status", record.providerStatus || "Awaiting Dispatch", Smartphone],
              ["ETA", record.estimatedArrivalMinutes == null ? "Updating" : `${Math.max(0, Math.round(record.estimatedArrivalMinutes))} min`, Clock3],
              ["Location", record.location.address || record.location.label || "GPS confirmed", MapPin],
            ].map(([label, value, Icon]) => {
              const MetricIcon = Icon as typeof Truck;
              return (
                <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                  <MetricIcon className="h-5 w-5 text-cyan-300" />
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">{String(label)}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{String(value)}</p>
                </div>
              );
            })}
          </div>
        </header>

        <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_rgba(2,8,23,0.25)] sm:p-6">
          <ProviderTrackingDashboard
            requestId={record.requestId || requestId}
            customerLocation={record.location}
            initialRecord={record}
            onRecordChange={(nextRecord) => {
              setRecord(nextRecord);
              saveVerifiedEmergencyRequest(nextRecord);
            }}
          />
        </section>

        <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm leading-6 text-cyan-950">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              <span className="font-semibold">No DispatchOS account is required.</span> Your verified ChargeNext service session is remembered on this device so you can return to this tracking screen while the job is active.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
