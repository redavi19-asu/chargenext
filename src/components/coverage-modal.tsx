"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

type CoverageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Washington DC coordinates
const DC_LAT = 38.9072;
const DC_LNG = -77.0369;

// 30 miles in kilometers
const RADIUS_KM = 48.28;

type LeafletCircleLike = {
  addTo: (map: unknown) => LeafletCircleLike;
  remove: () => void;
};

type LeafletApiLike = {
  circle: (center: [number, number], options: { radius: number; fillColor: string; color: string; weight: number; opacity: number; fillOpacity: number }) => LeafletCircleLike;
};

function CoverageCircles() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    try {
      // Add bright blue circle for 30-mile radius
      const circle = (Leaflet as unknown as LeafletApiLike).circle([DC_LAT, DC_LNG], {
        radius: RADIUS_KM * 1000,
        fillColor: "#00D4FF",
        color: "#0080FF",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.45,
      });

      circle.addTo(map);

      return () => {
        circle.remove();
      };
    } catch (error) {
      console.error("Error adding circles:", error);
    }
  }, [map]);

  return null;
}

function MapWithCircle() {
  return (
    <MapContainer
      center={[DC_LAT, DC_LNG]}
      zoom={8}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CoverageCircles />
    </MapContainer>
  );
}

export function CoverageModal({ isOpen, onClose }: CoverageModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" layout="fixed-header-footer">
      <ModalHeader onClose={onClose} showCloseButton>
        <h2 className="text-2xl font-bold text-slate-900">ChargeNext Coverage Area</h2>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <p className="text-slate-700">
            We currently serve the Washington DC area and surrounding regions within a 30-mile radius.
          </p>
          <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-lg">
            <MapWithCircle />
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
            <p className="font-semibold mb-1">✓ We&apos;re expanding!</p>
            <p>If your area isn&apos;t shown, contact us to learn about availability in your region.</p>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
