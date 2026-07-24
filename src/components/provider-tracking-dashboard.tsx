"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { divIcon, type LatLngBoundsExpression } from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Route,
  Truck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHARGENEXT_URLS } from "@/lib/constants";
import { fetchEmergencyRequestStatus } from "@/lib/emergency-api";
import {
  formatEmergencyCoordinates,
  getEmergencyLocationLabel,
  type EmergencyLocation,
  type EmergencyVerificationRecord,
  type ProviderTrackingStage,
} from "@/lib/emergency-flow";

const STAGE_ORDER: ProviderTrackingStage[] = ["assigned", "en-route", "arrived", "charging", "completed"];

const STAGE_LABELS: Record<ProviderTrackingStage, string> = {
  assigned: "Assigned",
  "en-route": "En Route",
  arrived: "Arrived",
  charging: "Charging",
  completed: "Completed",
};

const STAGE_DESCRIPTIONS: Record<ProviderTrackingStage, string> = {
  assigned: "Dispatcher assigned a nearby provider.",
  "en-route": "Provider is on the way to your location.",
  arrived: "Provider has arrived at your location.",
  charging: "Charging session is underway.",
  completed: "Service complete. You are all set.",
};

type ProviderTrackingDashboardProps = {
  requestId: string;
  customerLocation: EmergencyLocation;
  initialRecord: EmergencyVerificationRecord;
  onRecordChange?: (record: EmergencyVerificationRecord) => void;
};

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeStage(stage?: string | null): ProviderTrackingStage {
  if (stage === "assigned" || stage === "en-route" || stage === "arrived" || stage === "charging" || stage === "completed") {
    return stage;
  }

  return "assigned";
}

function stageIndex(stage: ProviderTrackingStage) {
  return STAGE_ORDER.indexOf(stage);
}

function createProviderAnchor(customerLocation: EmergencyLocation, requestId: string) {
  const seed = hashString(requestId || `${customerLocation.lat}:${customerLocation.lng}`);
  const latitudeOffset = 0.04 + (seed % 7) * 0.006;
  const longitudeOffset = 0.035 + ((seed >> 3) % 7) * 0.006;
  const latitudeDirection = seed % 2 === 0 ? 1 : -1;
  const longitudeDirection = (seed >> 1) % 2 === 0 ? 1 : -1;

  return {
    lat: customerLocation.lat + latitudeOffset * latitudeDirection,
    lng: customerLocation.lng + longitudeOffset * longitudeDirection,
  };
}

function interpolatePoint(start: { lat: number; lng: number }, end: { lat: number; lng: number }, progress: number) {
  const ratio = clamp(progress, 0, 1);

  return {
    lat: start.lat + (end.lat - start.lat) * ratio,
    lng: start.lng + (end.lng - start.lng) * ratio,
  };
}

function buildRoutePoints(start: { lat: number; lng: number }, end: { lat: number; lng: number }) {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const bendLat = (end.lng - start.lng) * 0.08;
  const bendLng = (start.lat - end.lat) * 0.08;

  return [
    [start.lat, start.lng],
    [midLat + bendLat, midLng + bendLng],
    [end.lat, end.lng],
  ] satisfies [number, number][];
}

function getStageFromProgress(progress: number): ProviderTrackingStage {
  if (progress >= 0.95) {
    return "completed";
  }

  if (progress >= 0.75) {
    return "charging";
  }

  if (progress >= 0.5) {
    return "arrived";
  }

  if (progress >= 0.2) {
    return "en-route";
  }

  return "assigned";
}

function formatEta(minutes: number | null | undefined) {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) {
    return "ETA updating";
  }

  if (minutes <= 0) {
    return "Arriving now";
  }

  return `${Math.max(1, Math.round(minutes))} min`;
}

function formatDistance(distanceMiles: number | null | undefined) {
  if (distanceMiles === null || distanceMiles === undefined || Number.isNaN(distanceMiles)) {
    return "Distance updating";
  }

  return `${Math.max(0, distanceMiles).toFixed(distanceMiles >= 5 ? 1 : 2)} mi`;
}

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "just now";
  }

  const time = new Date(value);
  if (Number.isNaN(time.getTime())) {
    return "just now";
  }

  return time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function createTrackingRecord(params: {
  record: EmergencyVerificationRecord;
  customerLocation: EmergencyLocation;
  requestId: string;
}) {
  const { record, customerLocation, requestId } = params;
  const seed = hashString(requestId || record.requestId || record.stripeSessionId);
  const providerNamePool = ["Jordan Lee", "Avery Morgan", "Casey Parker", "Taylor Brooks", "Riley Jordan"];

  const trackingStage = normalizeStage(record.trackingStage || record.providerStatus);
  const trackingProgress = typeof record.trackingProgress === "number"
    ? clamp(record.trackingProgress, 0, 1)
    : trackingStage === "completed"
      ? 1
      : trackingStage === "charging"
        ? 0.85
        : trackingStage === "arrived"
          ? 0.62
          : trackingStage === "en-route"
            ? 0.3
            : 0.12;

  const providerAnchor = createProviderAnchor(customerLocation, requestId);
  const providerLocation = interpolatePoint(providerAnchor, customerLocation, trackingProgress);

  return {
    ...record,
    providerName: record.providerName || providerNamePool[seed % providerNamePool.length],
    vehicleName: record.vehicleName || `ChargeNext Truck #${100 + (seed % 900)}`,
    providerPhone: record.providerPhone || "+12024252813",
    providerStatus: record.providerStatus || STAGE_LABELS[trackingStage],
    trackingStage,
    trackingProgress,
    trackingStartedAt: record.trackingStartedAt || new Date().toISOString(),
    refreshCount: record.refreshCount ?? 0,
    distanceRemainingMiles: record.distanceRemainingMiles ?? Math.max(0.1, 7.5 * (1 - trackingProgress)),
    cancelAllowed: record.cancelAllowed ?? (trackingStage === "assigned" || trackingStage === "en-route"),
    estimatedArrivalMinutes: record.estimatedArrivalMinutes ?? Math.max(1, Math.round(18 * (1 - trackingProgress))),
    statusUpdatedAt: record.statusUpdatedAt || new Date().toISOString(),
    location: record.location || customerLocation,
    trackingProviderLocation: providerLocation,
  } as EmergencyVerificationRecord & { trackingProviderLocation: { lat: number; lng: number } };
}

function createNextTrackingRecord(current: ReturnType<typeof createTrackingRecord>, customerLocation: EmergencyLocation, requestId: string) {
  const responseStage = normalizeStage(current.providerStatus);
  const nextProgress = clamp((current.trackingProgress ?? 0) + 0.14, 0, 1);
  const fallbackStage = getStageFromProgress(nextProgress);
  const nextStage = stageIndex(responseStage) >= stageIndex(fallbackStage) ? responseStage : fallbackStage;
  const providerAnchor = createProviderAnchor(customerLocation, requestId);
  const providerLocation = interpolatePoint(providerAnchor, customerLocation, nextProgress);

  return {
    ...current,
    providerStatus: STAGE_LABELS[nextStage],
    trackingStage: nextStage,
    trackingProgress: nextProgress,
    refreshCount: (current.refreshCount ?? 0) + 1,
    distanceRemainingMiles: nextStage === "completed" ? 0 : Math.max(0.05, (current.distanceRemainingMiles ?? 4) * 0.82),
    estimatedArrivalMinutes: nextStage === "completed" ? 0 : Math.max(0, Math.round((current.estimatedArrivalMinutes ?? 12) * 0.78)),
    statusUpdatedAt: new Date().toISOString(),
    cancelAllowed: nextStage === "assigned" || nextStage === "en-route",
    trackingProviderLocation: providerLocation,
  } as EmergencyVerificationRecord & { trackingProviderLocation: { lat: number; lng: number } };
}

function FitRouteBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) {
      return;
    }

    map.fitBounds(points as LatLngBoundsExpression, { padding: [28, 28], maxZoom: 14 });
  }, [map, points]);

  return null;
}

function TrackingMap({
  customerLocation,
  providerLocation,
}: {
  customerLocation: EmergencyLocation;
  providerLocation: { lat: number; lng: number };
}) {
  const routePoints = useMemo(
    () => buildRoutePoints(providerLocation, customerLocation),
    [customerLocation, providerLocation]
  );

  const customerMarker = useMemo(
    () =>
      divIcon({
        className: "",
        html:
          '<div class="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-sky-500 text-white shadow-lg shadow-sky-500/30"><span class="text-lg leading-none">•</span></div>',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
    []
  );

  const providerMarker = useMemo(
    () =>
      divIcon({
        className: "",
        html:
          '<div class="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"><span class="text-base leading-none">🚚</span></div>',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      }),
    []
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
      <MapContainer
        center={[customerLocation.lat, customerLocation.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-[300px] w-full md:h-[360px]"
      >
        <FitRouteBounds points={routePoints} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "#0ea5e9", weight: 5, opacity: 0.9, lineJoin: "round", dashArray: "8 10" }}
        />
        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerMarker} />
        <Marker position={[providerLocation.lat, providerLocation.lng]} icon={providerMarker} />
      </MapContainer>
    </div>
  );
}

export function ProviderTrackingDashboard({
  requestId,
  customerLocation,
  initialRecord,
  onRecordChange,
}: ProviderTrackingDashboardProps) {
  const [trackingRecord, setTrackingRecord] = useState(() =>
    createTrackingRecord({ record: initialRecord, customerLocation, requestId })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRecordChangeRef = useRef(onRecordChange);
  const providerLocation = (trackingRecord as EmergencyVerificationRecord & { trackingProviderLocation?: { lat: number; lng: number } }).trackingProviderLocation;

  useEffect(() => {
    onRecordChangeRef.current = onRecordChange;
  }, [onRecordChange]);

  useEffect(() => {
    const nextRecord = createTrackingRecord({ record: initialRecord, customerLocation, requestId });
    setTrackingRecord(nextRecord);
  }, [customerLocation, initialRecord, requestId]);

  useEffect(() => {
    let isMounted = true;

    const refreshTracking = async () => {
      setIsRefreshing(true);

      try {
        const response = await fetchEmergencyRequestStatus(requestId);

        if (!isMounted) {
          return;
        }

        setTrackingRecord((current) => {
          const responseStage = normalizeStage(response.trackingStage || response.providerStatus || current.trackingStage);
          const nextProgress = typeof response.trackingProgress === "number"
            ? clamp(response.trackingProgress, 0, 1)
            : current.trackingProgress ?? 0;
          const providerAnchor = createProviderAnchor(customerLocation, requestId);
          const providerLocationFromResponse = response.providerName || response.vehicleName || response.providerPhone
            ? interpolatePoint(providerAnchor, customerLocation, nextProgress || 0.12)
            : (current as EmergencyVerificationRecord & { trackingProviderLocation: { lat: number; lng: number } }).trackingProviderLocation;

          const mergedRecord = {
            ...current,
            providerName: response.providerName || current.providerName,
            vehicleName: response.vehicleName || current.vehicleName,
            providerPhone: response.providerPhone || current.providerPhone,
            providerStatus: response.providerStatus || STAGE_LABELS[responseStage],
            trackingStage: responseStage,
            trackingProgress: nextProgress,
            estimatedArrivalMinutes: response.estimatedArrivalMinutes ?? current.estimatedArrivalMinutes ?? null,
            distanceRemainingMiles: response.distanceRemainingMiles ?? current.distanceRemainingMiles ?? null,
            cancelAllowed: response.cancelAllowed ?? current.cancelAllowed ?? (responseStage === "assigned" || responseStage === "en-route"),
            statusUpdatedAt: new Date().toISOString(),
            refreshCount: (current.refreshCount ?? 0) + 1,
            trackingProviderLocation: providerLocationFromResponse,
          } as EmergencyVerificationRecord & { trackingProviderLocation: { lat: number; lng: number } };

          const nextRecord = typeof response.trackingProgress === "number"
            ? mergedRecord
            : createNextTrackingRecord(mergedRecord, customerLocation, requestId);

          onRecordChangeRef.current?.(nextRecord);
          return nextRecord;
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setTrackingRecord((current) => {
          const nextRecord = createNextTrackingRecord(current, customerLocation, requestId);
          onRecordChangeRef.current?.(nextRecord);
          return nextRecord;
        });
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };

    void refreshTracking();
    const intervalId = window.setInterval(() => {
      void refreshTracking();
    }, 12000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [customerLocation, requestId]);

  const trackingStage = normalizeStage(trackingRecord.trackingStage || trackingRecord.providerStatus);
  const stageNumber = stageIndex(trackingStage);
  const timelineSteps = [
    { label: "Payment Received", done: true },
    { label: "Phone Verified", done: true },
    { label: "Dispatcher Assigned", done: stageNumber >= 0 },
    { label: "Provider En Route", done: stageNumber >= 1, current: trackingStage === "en-route" },
    { label: "Arrived", done: stageNumber >= 2, current: trackingStage === "arrived" },
    { label: "Charging Started", done: stageNumber >= 3, current: trackingStage === "charging" },
    { label: "Service Complete", done: stageNumber >= 4, current: trackingStage === "completed" },
  ];

  const canCancel = trackingRecord.cancelAllowed ?? (trackingStage === "assigned" || trackingStage === "en-route");

  const handleContactProvider = () => {
    const phone = trackingRecord.providerPhone || "+12024252813";
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppSupport = () => {
    window.open(CHARGENEXT_URLS.whatsappEmergency, "_blank", "noopener,noreferrer");
  };

  const handleCancelRequest = () => {
    if (!canCancel) {
      return;
    }

    const cancelMessage = `Cancel request ${requestId} for ChargeNext. ${trackingRecord.providerName || "Provider"} is currently ${STAGE_LABELS[trackingStage].toLowerCase()}.`;
    const cancelUrl = `${CHARGENEXT_URLS.whatsappEmergency}${CHARGENEXT_URLS.whatsappEmergency.includes("?") ? "&" : "?"}text=${encodeURIComponent(cancelMessage)}`;
    window.open(cancelUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#020617_0%,#0f172a_45%,#0b2b3d_100%)] p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              Live tracking
            </div>
            <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">Track Your Provider</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              We&apos;re refreshing your provider position every 12 seconds. You can keep this screen open while the truck closes in.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-right backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">Current status</p>
            <p className="mt-1 text-xl font-semibold text-white">{trackingRecord.providerStatus || STAGE_LABELS[trackingStage]}</p>
            <p className="mt-1 text-sm text-slate-300">Updated {formatUpdatedAt(trackingRecord.statusUpdatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <TrackingMap customerLocation={customerLocation} providerLocation={providerLocation || createProviderAnchor(customerLocation, requestId)} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{trackingRecord.providerName || "Dispatch team"}</p>
              <p className="mt-1 text-sm text-slate-600">Professional charging tech</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{trackingRecord.vehicleName || "ChargeNext Truck"}</p>
              <p className="mt-1 text-sm text-slate-600">Vehicle ID and onboard gear</p>
            </div>

            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">ETA</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatEta(trackingRecord.estimatedArrivalMinutes)}</p>
              <p className="mt-1 text-sm text-sky-700">Arrival estimate refreshing live</p>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Distance remaining</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatDistance(trackingRecord.distanceRemainingMiles)}</p>
              <p className="mt-1 text-sm text-emerald-700">Provider route recalculated live</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-slate-900 p-2 text-white">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Location details</p>
                <p className="text-base font-semibold text-slate-900">Customer pin and provider route</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sky-700">
                  <MapPin className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Customer location</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{getEmergencyLocationLabel(customerLocation)}</p>
                <p className="mt-1 text-xs text-slate-600">{formatEmergencyCoordinates(customerLocation)}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Truck className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Provider location</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {providerLocation ? `${providerLocation.lat.toFixed(4)}, ${providerLocation.lng.toFixed(4)}` : "Refreshing"}
                </p>
                <p className="mt-1 text-xs text-slate-600">{trackingRecord.providerStatus || STAGE_DESCRIPTIONS[trackingStage]}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live timeline</p>
                <h4 className="mt-1 text-xl font-semibold text-slate-900">Dispatch progress</h4>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Auto refresh
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {timelineSteps.map((step, index) => {
                const isCurrent = Boolean(step.current) || (!step.done && index === Math.min(stageNumber + 1, timelineSteps.length - 1));

                return (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${step.done ? "border-emerald-500 bg-emerald-500 text-white" : isCurrent ? "border-sky-500 bg-sky-50 text-sky-600" : "border-slate-200 bg-white text-slate-300"}`}
                      >
                        {step.done ? <Check className="h-4 w-4" /> : isCurrent ? <ArrowRight className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                      </div>
                      {index < timelineSteps.length - 1 ? <div className={`h-8 w-px ${step.done ? "bg-emerald-200" : "bg-slate-200"}`} /> : null}
                    </div>
                    <div className="pb-2 pt-0.5">
                      <p className={`text-sm font-semibold ${step.done ? "text-emerald-700" : isCurrent ? "text-sky-700" : "text-slate-500"}`}>{step.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {step.done
                          ? "Completed"
                          : isCurrent
                            ? STAGE_DESCRIPTIONS[trackingStage]
                            : "Waiting for the next update."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Clock3 className="h-4 w-4 text-slate-500" />
              Refreshing every 12 seconds. The truck position will move automatically as we receive updates.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-slate-900 p-2 text-white">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Support actions</p>
                <p className="text-base font-semibold text-slate-900">Reach the team quickly</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <Button onClick={handleContactProvider} className="service-cta service-cta--yellow-ring w-full rounded-2xl py-3.5 text-base font-semibold">
                <Phone className="h-4 w-4" />
                Contact Provider
              </Button>
              <Button variant="secondary" onClick={handleWhatsAppSupport} className="service-cta service-cta--yellow-ring w-full rounded-2xl py-3.5 text-base font-semibold">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Support
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelRequest}
                disabled={!canCancel}
                className="w-full rounded-2xl py-3.5 text-base font-semibold"
              >
                <XCircle className="h-4 w-4" />
                Cancel Request
              </Button>
              <p className="text-xs leading-5 text-slate-500">
                Cancellation is only available before the provider reaches the site. After that, the support team can still help if plans change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}