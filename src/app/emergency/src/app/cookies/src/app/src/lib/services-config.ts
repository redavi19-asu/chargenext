/**
 * ChargeNext service definitions and pricing
 * Centralized configuration for all paid services
 */

export type ServiceId = "emergency-boost" | "extended-boost" | "full-charge-session" | "pull-up-boost";

export interface ChargeNextService {
  id: ServiceId;
  name: string;
  description: string;
  priceAmount: number; // in cents or as integer for Stripe
  displayPrice: string;
  estimatedDuration?: string;
  estimatedRange?: string;
  bullets: string[];
  caution?: string | null;
  metadata?: Record<string, string>;
}

export const CHARGENEXT_SERVICES: Record<ServiceId, ChargeNextService> = {
  "emergency-boost": {
    id: "emergency-boost",
    name: "Emergency Boost",
    description: "For immediate assistance",
    priceAmount: 59, // $59.00
    displayPrice: "$59",
    estimatedDuration: "30-45 minutes",
    estimatedRange: "Up to 40 miles",
    bullets: [
      "Dispatch within standard hours",
      "Live ETA and updates",
      "Adapter included",
    ],
    caution: null,
    metadata: {
      service_type: "emergency",
      service_category: "boost",
    },
  },
  "extended-boost": {
    id: "extended-boost",
    name: "Extended Boost",
    description: "Extra range for longer drives",
    priceAmount: 89, // $89.00
    displayPrice: "$89",
    estimatedDuration: "45-60 minutes",
    estimatedRange: "Up to 60 miles",
    bullets: [
      "Up to 60 minutes charging",
      "Live tracking included",
      "Ideal for continuing your trip",
      "All connectors available",
    ],
    caution: null,
    metadata: {
      service_type: "scheduled",
      service_category: "boost",
    },
  },
  "full-charge-session": {
    id: "full-charge-session",
    name: "Full Charge Session",
    description: "Scheduled charging service",
    priceAmount: 129, // $129.00
    displayPrice: "$129",
    estimatedDuration: "2-3 hours",
    estimatedRange: "Full battery capacity",
    bullets: [
      "Up to 2–3 hours charging",
      "Best for home or work",
      "Scheduled convenience",
      "Real-time monitoring",
    ],
    caution: "⚠ Charging time depends on vehicle battery size.",
    metadata: {
      service_type: "scheduled",
      service_category: "full_charge",
    },
  },
  "pull-up-boost": {
    id: "pull-up-boost",
    name: "Pull-Up Boost",
    description: "Quick boost while you wait",
    priceAmount: 25, // $25.00 baseline
    displayPrice: "Starting at $25",
    estimatedDuration: "15-20 minutes",
    estimatedRange: "10–20 miles",
    bullets: [
      "10–20 mile quick boost",
      "15–20 minute session",
      "Perfect for top-ups",
      "Available when our truck is nearby",
    ],
    caution: null,
    metadata: {
      service_type: "instant",
      service_category: "boost",
    },
  },
};

/**
 * Get a service by ID
 */
export function getService(serviceId: ServiceId): ChargeNextService | null {
  return CHARGENEXT_SERVICES[serviceId] ?? null;
}

/**
 * Get all paid services (excluding Fleet Services which is custom quote)
 */
export function getPaidServices(): ChargeNextService[] {
  return Object.values(CHARGENEXT_SERVICES);
}

/**
 * Build Stripe metadata for a service
 */
export function getServiceMetadata(serviceId: ServiceId): Record<string, string> {
  const service = getService(serviceId);
  if (!service) return {};
  
  return {
    service_id: serviceId,
    service_name: service.name,
    ...service.metadata,
  };
}
