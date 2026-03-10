/**
 * Map Bounds DTO
 * Limites geográficos para enmarcar unidades
 * GeoJSON standard: [minLon, minLat, maxLon, maxLat]
 */
export interface MapBoundsDto {
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
  padding?: number;       // Padding en pixels
}
