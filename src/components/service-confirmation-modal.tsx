"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { ServiceProcessCard } from "@/components/service-process-card";
import { type ChargeNextService } from "@/lib/services-config";
import { formatEmergencyCoordinates, type EmergencyLocation } from "@/lib/emergency-flow";
import { reverseGeocodeLocation } from "@/lib/reverse-geocode";

type ServiceConfirmationModalProps = {
  isOpen: boolean;
  service: ChargeNextService | null;
  location: EmergencyLocation | null;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onLocationChange?: (location: EmergencyLocation | null) => void;
};

export function ServiceConfirmationModal({
  isOpen,
  service,
  location,
  isProcessing,
  onConfirm,
  onCancel,
  onLocationChange,
}: ServiceConfirmationModalProps) {
  const [currentLocation, setCurrentLocation] = useState<EmergencyLocation | null>(location);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualLat, setManualLat] = useState(location ? String(location.lat) : "");
  const [manualLng, setManualLng] = useState(location ? String(location.lng) : "");
  const [manualAddress, setManualAddress] = useState(location?.address ?? location?.label ?? "");

  const mapEmbedUrl = useMemo(() => {
    if (!currentLocation) {
      return "https://www.google.com/maps?output=embed&q=Washington%2C%20DC";
    }

    return `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}&z=16&output=embed`;
  }, [currentLocation]);

  useEffect(() => {
    setCurrentLocation(location);
    setManualLat(location ? String(location.lat) : "");
    setManualLng(location ? String(location.lng) : "");
    setManualAddress(location?.address ?? location?.label ?? "");
    setLocationError("");
    setIsEditingLocation(false);
  }, [location, isOpen]);

  useEffect(() => {
    let isActive = true;

    const resolveAddress = async () => {
      if (!currentLocation) {
        setResolvedAddress("");
        return;
      }

      if (currentLocation.address || currentLocation.label) {
        setResolvedAddress(currentLocation.address || currentLocation.label || "");
        return;
      }

      setIsResolvingAddress(true);

      try {
        const nextAddress = await reverseGeocodeLocation(currentLocation);
        if (isActive) {
          setResolvedAddress(nextAddress || "Location confirmed");
        }
      } catch {
        if (isActive) {
          setResolvedAddress("Location confirmed");
        }
      } finally {
        if (isActive) {
          setIsResolvingAddress(false);
        }
      }
    };

    void resolveAddress();

    return () => {
      isActive = false;
    };
  }, [currentLocation]);

  const updateLocation = (nextLocation: EmergencyLocation | null) => {
    setCurrentLocation(nextLocation);
    onLocationChange?.(nextLocation);
  };

  const handleRefreshLocation = async () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation: EmergencyLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "gps",
        };

        updateLocation(nextLocation);
        setManualLat(String(nextLocation.lat));
        setManualLng(String(nextLocation.lng));
        setManualAddress("");
      },
      () => {
        setLocationError("Unable to refresh your current location. You can still correct it manually.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSaveDifferentLocation = async () => {
    const lat = Number(manualLat);
    const lng = Number(manualLng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setLocationError("Enter valid latitude and longitude values before saving the correction.");
      return;
    }

    const nextLocation: EmergencyLocation = {
      lat,
      lng,
      address: manualAddress.trim() || undefined,
      label: manualAddress.trim() || undefined,
      source: "manual",
    };

    updateLocation(nextLocation);
    setIsEditingLocation(false);
    setLocationError("");

    if (!nextLocation.address && !nextLocation.label) {
      setIsResolvingAddress(true);

      try {
        const nextAddress = await reverseGeocodeLocation(nextLocation);
        if (nextAddress) {
          setResolvedAddress(nextAddress);
          const updatedLocation = { ...nextLocation, address: nextAddress, label: nextAddress };
          updateLocation(updatedLocation);
        }
      } catch {
        setResolvedAddress("Location confirmed");
      } finally {
        setIsResolvingAddress(false);
      }
    } else {
      setResolvedAddress(nextLocation.address || nextLocation.label || "");
    }
  };

  const displayAddress = resolvedAddress || currentLocation?.address || currentLocation?.label || "Detecting your location...";

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
            <p className="text-sm text-slate-500">Preview service details — online payments coming soon</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{service.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{service.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-sky-600">{service.displayPrice}</p>
                <p className="text-xs text-slate-500">preview pricing</p>
              </div>
            </div>

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

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 uppercase">What&apos;s Included</p>
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

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-600" />
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold uppercase text-slate-700">Service Location</p>
                <p className="text-sm font-semibold text-slate-900">
                  {isResolvingAddress ? "Resolving address..." : displayAddress}
                </p>
                {currentLocation && (
                  <p className="mt-1 text-xs text-slate-600">{formatEmergencyCoordinates(currentLocation)}</p>
                )}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <iframe
                src={mapEmbedUrl}
                title="Service location map"
                className="h-[280px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="secondary"
                onClick={handleRefreshLocation}
                className="service-cta service-cta--yellow-ring rounded-xl h-12 text-sm font-medium"
                disabled={isProcessing}
              >
                <MapPin className="h-4 w-4" />
                Refresh Location
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditingLocation((current) => !current)}
                className="service-cta service-cta--yellow-ring rounded-xl h-12 text-sm font-medium"
                disabled={isProcessing}
              >
                Use Different Location
              </Button>
            </div>

            {isEditingLocation && (
              <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">Latitude</label>
                    <input
                      type="text"
                      value={manualLat}
                      onChange={(event) => setManualLat(event.target.value)}
                      disabled={isProcessing}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">Longitude</label>
                    <input
                      type="text"
                      value={manualLng}
                      onChange={(event) => setManualLng(event.target.value)}
                      disabled={isProcessing}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">Address or landmark</label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(event) => setManualAddress(event.target.value)}
                    placeholder="Parking lot entrance, building name, or nearby landmark"
                    disabled={isProcessing}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveDifferentLocation}
                    className="service-cta service-cta--yellow-ring flex-1 rounded-xl h-12 text-sm font-medium"
                    disabled={isProcessing}
                  >
                    Save Location
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingLocation(false)}
                    className="flex-1 rounded-xl h-12 text-sm font-medium"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {locationError && (
              <p className="mt-3 text-sm text-rose-700">{locationError}</p>
            )}
          </div>

          <ServiceProcessCard
            title={`${service.name} process`}
            intro={`Here&apos;s what happens when you request ${service.name.toLowerCase()}:`}
          />

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <p className="font-semibold">Online payments are coming soon.</p>
            <p className="mt-1 text-xs text-sky-800">
              The Stripe integration is being kept in place for launch, but checkout is disabled and no payment can be submitted right now.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p>
              Service information is currently available for preview. Before launch, checkout will require agreement to our{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 font-semibold">
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 font-semibold">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            onClick={onConfirm}
            disabled
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold bg-slate-200 text-slate-500 cursor-not-allowed"
          >
            <Zap className="h-5 w-5 mr-2" />
            Online Payments Coming Soon
          </Button>

          <Button
            onClick={onCancel}
            disabled={isProcessing}
            variant="secondary"
            className="w-full sm:flex-1 rounded-xl h-12 text-base font-semibold"
          >
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
