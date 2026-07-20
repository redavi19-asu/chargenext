declare module "leaflet" {
  export type LatLngBoundsExpression = ReadonlyArray<readonly [number, number]>;

  export function divIcon(options?: Record<string, unknown>): unknown;
}
