declare module "react-leaflet" {
  import type { ComponentType } from "react";
  import type { LatLngBoundsExpression } from "leaflet";

  type LeafletProps = Record<string, unknown> & {
    children?: React.ReactNode;
  };

  export const MapContainer: ComponentType<LeafletProps>;
  export const Marker: ComponentType<LeafletProps>;
  export const Polyline: ComponentType<LeafletProps>;
  export const TileLayer: ComponentType<LeafletProps>;
  export function useMap(): {
    fitBounds: (bounds: LatLngBoundsExpression, options?: Record<string, unknown>) => void;
  };
}
