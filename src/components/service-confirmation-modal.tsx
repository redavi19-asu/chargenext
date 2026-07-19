"use client";

import { Clock, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { type ChargeNextService } from "@/lib/services-config";
import type { EmergencyLocation } from "@/lib/emergency-flow";

type ServiceConfirmationModalProps = {
  isOpen: boolean;
  service: ChargeNextService | null;
  location: EmergencyLocation | null;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ServiceConfirmationModal({
  isOpen,
  service,
  location,
  isProcessing,
  onConfirm,
  onCancel,
}: ServiceConfirmationModalProps) {
  if (!service) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="large"
      layout="fixed-header-footer"
      closeOnBackdrop={!isProcessing}
      closeOnEscape={!isProcessing}
      showCloseButton={!isProcessing}
    >
      <ModalHeader onClose={onCancel} showCloseButton={!isProcessing}>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-sky-100 p-2">
            <Zap className="h-6 w-6 text-sky-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Confirm Service</h2>
            <p className="text-sm text-slate-500">Review your selection before proceeding</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Service Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{service.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{service.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-sky-600">{service.displayPrice}</p>
                <p className="text-xs text-slate-500">one-time charge</p>
              </div>
            </div>

            {/* Service Details Grid */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {service.estimatedDuration && (
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <p className="text-xs font-semibold text-slate-700 uppercase">Duration</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{service.estimatedDuration}</p>
                </div>
              )}
              {service.estimatedRange && (
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-slate-600" />
                    <p className="text-xs font-semibold text-slate-700 uppercase">Range</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{service.estimatedRange}</p>
                </div>
              )}
            </div>

            {/* Service Highlights */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 uppercase">What's Included</p>
              <ul className="space-y-2">
                {service.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="rounded-full bg-sky-100 text-sky-600 p-1 flex-shrink-0 mt-0.5">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {service.caution && (
              <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-900">{service.caution}</p>
              </div>
            )}
          </div>

          {/* Location Summary */}
          {location && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-1">Service Location</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {location.label || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                  </p>
                  {location.address && (
                    <p className="text-xs text-slate-600 mt-1">{location.address}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legal Notice */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p>
              By confirming, you agree to our{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 font-semibold">
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 font-semibold">
                Privacy Policy
              </a>
              . Payment is processed securely through Stripe.
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
          >
            {isProcessing ? (
              <>
                <Zap className="h-5 w-5 mr-2 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Continue to Secure Payment
              </>
            )}
          </Button>

          <Button
            onClick={onCancel}
            disabled={isProcessing}
            variant="secondary"
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
          >
            Cancel
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
