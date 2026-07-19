"use client";

import { MapPin, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
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
            <p className="text-sm text-slate-500">6-step process before payment</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-8">
          {/* Main Description */}
          <p className="text-base text-slate-600 leading-relaxed">
            Here's what happens when you request emergency charging:
          </p>

          {/* Process Steps */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <ol className="space-y-3">
              <li className="flex gap-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 flex-shrink-0">1</span>
                <span className="text-sm text-slate-700 pt-1">Confirm your emergency location</span>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 flex-shrink-0">2</span>
                <span className="text-sm text-slate-700 pt-1">Continue to secure Stripe payment</span>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 flex-shrink-0">3</span>
                <span className="text-sm text-slate-700 pt-1">Return to ChargeNext after payment</span>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 flex-shrink-0">4</span>
                <span className="text-sm text-slate-700 pt-1">Verify your phone number with SMS code</span>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 flex-shrink-0">5</span>
                <span className="text-sm text-slate-700 pt-1">Request and location sent to available providers</span>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 flex-shrink-0">6</span>
                <span className="text-sm text-slate-700 pt-1">Track provider status from customer dashboard</span>
              </li>
            </ol>
          </div>

          {/* Important Notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm font-semibold text-amber-900 mb-2">Important Notice</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Payment does not immediately guarantee provider availability. ChargeNext will begin locating an available provider after your payment, phone number, and emergency location have been verified.
            </p>
          </div>

          {/* Location & Payment Details Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Location */}
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
                  className="w-full rounded-xl h-12 text-sm font-medium mt-4"
                  disabled={isDetectingLocation || isProcessing || hasSubmitted}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh My Location
                </Button>
              </div>
            </div>

            {/* Right Column - Map Preview & Payment Info */}
            <div className="space-y-6">
              {/* Map Preview */}
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

              {/* Payment Notice */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Secure Payment</p>
                <p className="text-sm text-emerald-900 leading-relaxed">
                  Stripe Checkout keeps your card details secure. You'll return to ChargeNext after payment to complete verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            onClick={onContinue}
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
            disabled={continueDisabled}
          >
            {isProcessing ? (
              <>
                <ShieldCheck className="h-5 w-5 mr-2 animate-pulse" />
                Creating Session...
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5 mr-2" />
                Continue to Secure Payment
              </>
            )}
          </Button>

          <Button
            onClick={onCancel}
            variant="secondary"
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
            disabled={isProcessing}
          >
            Cancel Request
          </Button>

          {hasSubmitted && (
            <p className="col-span-full text-xs text-slate-500 text-center">
              Payment session created. Redirecting to Stripe Checkout...
            </p>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
