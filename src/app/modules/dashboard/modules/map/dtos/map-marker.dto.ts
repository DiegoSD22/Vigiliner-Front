/**
 * Map Marker DTO
 * Representación de una unidad como marcador en el mapa
 * Optimizado para Mapbox GL
 */

import { type LocationDto } from './location.dto';

export interface MapMarkerDto {
  id: string;
  name: string;
  location: LocationDto;
  status: 'MOVING' | 'OFFLINE' | 'IDLE';
  type: string;           // Tipo de unidad: 'TRUCK', 'VAN', 'CAR', etc
  speed: number;
  heading?: number;
  color?: string;         // Color del marcador
  icon?: string;          // Nombre del ícono
  lastSeen?: Date;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}
