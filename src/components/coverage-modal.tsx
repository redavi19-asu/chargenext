"use client";

"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
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

function CoverageMapContent() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Add circle and marker after map is ready
    const timer = setTimeout(() => {
      if (mapRef.current && (mapRef.current as any)._leaflet_map) {
        const map = (mapRef.current as any)._leaflet_map;
        
        // Add bright blue/cyan circle overlay for 100-mile radius
        (L as any).circle([DC_LAT, DC_LNG], {
          radius: RADIUS_KM * 1000, // Convert km to meters
          fillColor: "#00B4FF", // Bright cyan/blue
          color: "#0080CC", // Darker blue border
          weight: 3,
          opacity: 1,
          fillOpacity: 0.35,
        }).addTo(map);
        
        // Add optional pink highlight circle (slightly smaller for effect)
        (L as any).circle([DC_LAT, DC_LNG], {
          radius: RADIUS_KM * 1000 * 0.95,
          fillColor: "#FF006E", // Hot pink
          color: "transparent",
          weight: 0,
          opacity: 0,
          fillOpacity: 0.08,
        }).addTo(map);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MapContainer
      center={[DC_LAT, DC_LNG]}
      zoom={8}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[DC_LAT, DC_LNG]}>
      </Marker>
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
            <CoverageMapContent />
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
