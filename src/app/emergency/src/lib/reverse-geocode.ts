import type { EmergencyLocation } from "@/lib/emergency-flow";

type ReverseGeocodeResult = {
  display_name?: string;
  address?: Record<string, string | undefined>;
};

export async function reverseGeocodeLocation(location: EmergencyLocation) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(location.lat),
    lon: String(location.lng),
    zoom: "18",
    addressdetails: "1",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with ${response.status}`);
  }

  const data = (await response.json()) as ReverseGeocodeResult;
  return data.display_name || data.address?.road || data.address?.neighbourhood || null;
}