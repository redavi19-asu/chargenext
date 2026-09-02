"use client";

import { MapPin, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { ServiceProcessCard } from "@/components/service-process-card";
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
}: EmergencyRequestModalProps) {
  const embedUrl = buildEmergencyMapsEmbedUrl(location);
  const mapsUrl = buildEmergencyMapsUrl(location);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="large"
      layout="fixed-header-footer"
      closeOnBackdrop={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <ModalHeader showCloseButton={false}>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-sky-100 p-2">
            <ShieldCheck className="h-6 w-6 text-sky-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Emergency Charging Request</h2>
            <p className="text-sm text-slate-500">Online payments coming soon</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-8">
          <p className="text-base text-slate-600 leading-relaxed">
            You can preview the emergency request flow and confirm your location. Online checkout is temporarily disabled while ChargeNext prepares for launch.
          </p>

          <ServiceProcessCard
            title="Emergency charging process"
            intro="Here&apos;s what happens when you request emergency charging:"
          />

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm font-semibold text-amber-900 mb-2">Coming Soon</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Stripe checkout is currently disabled. No card will be charged and no payment session can be created from this page.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-3 block">
                  <MapPin className="mr-2 inline h-4 w-4" />
                  Your Emergency Location
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Status</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {isDetectingLocation ? (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                          Detecting location...
                        </span>
                      ) : location ? (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          Location detected
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                          Waiting for GPS
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Coordinates</p>
                    <p className="text-sm font-semibold text-slate-900">{getEmergencyLocationLabel(location)}</p>
                    <p className="text-xs text-slate-600 mt-1">{formatEmergencyCoordinates(location)}</p>
                  </div>
                  {location && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <MapPin className="h-4 w-4" />
                      Open in Google Maps
                    </a>
                  )}
                </div>

                <Button
                  onClick={onUseCurrentLocation}
                  variant="secondary"
                  className="service-cta service-cta--yellow-ring w-full rounded-xl h-12 text-sm font-medium mt-4"
                  disabled={isDetectingLocation || isProcessing || hasSubmitted}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh My Location
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  <MapPin className="mr-2 inline h-4 w-4" />
                  Location Map
                </label>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    src={embedUrl}
                    title="Emergency request location preview"
                    className="h-64 w-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
                <p className="text-xs font-semibold text-sky-700 uppercase mb-2">Payment Status</p>
                <p className="text-sm text-sky-900 leading-relaxed">
                  Online payment is coming soon. The Stripe integration is being kept in place for launch, but checkout is disabled right now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            type="button"
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold bg-slate-200 text-slate-500 cursor-not-allowed"
            disabled
          >
            Online Payments Coming Soon
          </Button>

          <Button
            onClick={onCancel}
            variant="secondary"
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
            disabled={isProcessing}
          >
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
