/**
 * Location DTO
 * Coordenadas geográficas para Mapbox
 * Standard: Latitude/Longitude (GeoJSON compatible)
 */
export interface LocationDto {
  latitude: number;
  longitude: number;
  accuracy?: number;        // Precisión en metros
  altitude?: number;        // Altitud en metros
  heading?: number;         // Dirección en grados
  speed?: number;           // Velocidad en km/h
  timestamp?: Date;         // Cuándo se capturó
}
