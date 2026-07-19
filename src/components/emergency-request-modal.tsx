"use client";

import { MapPin, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
  buildEmergencyMapsEmbedUrl,
  buildEmergencyMapsUrl,
  formatEmergencyCoordinates,
  getEmergencyLocationLabel,
  type EmergencyLocation,
} from "@/lib/emergency-flow";

type EmergencyRequestModalProps = {
  isOpen: boolean;
  location: EmergencyLocation | null;
  isDetectingLocation: boolean;
  isProcessing: boolean;
  hasSubmitted: boolean;
  onUseCurrentLocation: () => void;
  onCancel: () => void;
  onContinue: () => void;
};

export function EmergencyRequestModal({
  isOpen,
  location,
  isDetectingLocation,
  isProcessing,
  hasSubmitted,
  onUseCurrentLocation,
  onCancel,
  onContinue,
}: EmergencyRequestModalProps) {
  const continueDisabled = isDetectingLocation || isProcessing || hasSubmitted || !location;
  const embedUrl = buildEmergencyMapsEmbedUrl(location);
  const mapsUrl = buildEmergencyMapsUrl(location);

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Emergency Charging Request">
      <div className="max-h-[78vh] space-y-5 overflow-y-auto pr-1">
        <p className="text-sm leading-6 text-slate-600">
          Here is what happens next:
        </p>

        <ol className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <li>1. Confirm your emergency location.</li>
          <li>2. Continue to secure Stripe payment.</li>
          <li>3. Return to ChargeNext after payment.</li>
          <li>4. Verify your phone number with a one-time SMS code.</li>
          <li>5. ChargeNext sends your verified request and location to available charging providers.</li>
          <li>6. Track your request and provider status from the customer status page.</li>
        </ol>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Payment does not immediately guarantee provider availability. ChargeNext will begin locating an available provider after your payment, phone number, and emergency location have been verified.
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected location</p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {isDetectingLocation ? "Location is still being detected..." : getEmergencyLocationLabel(location)}
                </p>
                <p className="mt-1 text-sm text-slate-600">{formatEmergencyCoordinates(location)}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {location ? `Latitude: ${location.lat.toFixed(6)} | Longitude: ${location.lng.toFixed(6)}` : "Waiting for GPS coordinates."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onUseCurrentLocation}
                  variant="secondary"
                  className="rounded-xl px-4 py-3 text-sm"
                  disabled={isDetectingLocation || isProcessing || hasSubmitted}
                >
                  <RefreshCw className="h-4 w-4" />
                  Use My Current Location
                </Button>
              </div>

              <Card className="overflow-hidden border-slate-200 bg-slate-50">
                <CardContent className="p-0">
                  <iframe
                    src={embedUrl}
                    title="Emergency request location preview"
                    className="h-56 w-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </CardContent>
              </Card>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-600"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
            <CardContent className="space-y-4 p-4">
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Secure payment notice</p>
                <p className="mt-1">Stripe Checkout keeps your card details secure. You will return to ChargeNext after payment.</p>
              </div>

              <Button
                onClick={onContinue}
                className="w-full rounded-xl px-4 py-3 text-sm"
                disabled={continueDisabled}
              >
                {isProcessing ? (
                  <>
                    <ShieldCheck className="h-4 w-4 animate-pulse" />
                    Creating Secure Payment Session...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    Continue to Secure Payment
                  </>
                )}
              </Button>

              <Button
                onClick={onCancel}
                variant="secondary"
                className="w-full rounded-xl px-4 py-3 text-sm"
                disabled={isProcessing}
              >
                Cancel
              </Button>

              {hasSubmitted ? (
                <p className="text-sm text-slate-600">A secure payment session has already been created. Please wait for the redirect.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </Modal>
  );
}