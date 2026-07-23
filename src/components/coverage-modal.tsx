"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type CoverageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Washington DC coordinates
const DC_LAT = 38.9072;
const DC_LNG = -77.0369;

// 100 miles in kilometers
const RADIUS_KM = 160.934;

function CoverageCircles() {
  const map = useMap() as any;

  useEffect(() => {
    if (!map) return;

    try {
      // Add bright blue circle for 100-mile radius
      const circle = (L as any).circle([DC_LAT, DC_LNG], {
        radius: RADIUS_KM * 1000,
        fillColor: "#00D4FF",
        color: "#0080FF",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.45,
      });

      circle.addTo(map);

      // Add pink dashed border
      const border = (L as any).circle([DC_LAT, DC_LNG], {
        radius: RADIUS_KM * 1000,
        fillColor: "transparent",
        color: "#FF1493",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0,
        dashArray: "8, 5",
      });

      border.addTo(map);

      return () => {
        try {
          map.removeLayer(circle);
          map.removeLayer(border);
        } catch (e) {
          // Layer already removed
        }
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
      <Marker position={[DC_LAT, DC_LNG]}>
      </Marker>
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
            We currently serve the Washington DC area and surrounding regions within a 100-mile radius.
          </p>
          <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-lg">
            <MapWithCircle />
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
            <p className="font-semibold mb-1">✓ We're expanding!</p>
            <p>If your area isn't shown, contact us to learn about availability in your region.</p>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
