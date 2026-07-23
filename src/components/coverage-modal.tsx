"use client";

import { useEffect, useRef, useState } from "react";
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

function MapWithCircle() {
  const mapRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    try {
      const map = mapRef.current._leaflet_map || mapRef.current;
      
      // Remove existing circle if any
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }

      // Create and add the bright blue circle
      const circle = (L as any).circle([DC_LAT, DC_LNG], {
        radius: RADIUS_KM * 1000,
        fillColor: "#00D4FF",
        color: "#0080FF",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.4,
      });

      circle.addTo(map);
      circleRef.current = circle;

      // Add a border circle for definition
      const borderCircle = (L as any).circle([DC_LAT, DC_LNG], {
        radius: RADIUS_KM * 1000,
        fillColor: "transparent",
        color: "#FF1493",
        weight: 1,
        opacity: 0.6,
        fillOpacity: 0,
        dashArray: "5, 10",
      });

      borderCircle.addTo(map);
    } catch (error) {
      console.error("Error adding circle to map:", error);
    }
  }, [mapReady]);

  return (
    <MapContainer
      center={[DC_LAT, DC_LNG]}
      zoom={8}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
      whenCreated={() => setMapReady(true)}
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
