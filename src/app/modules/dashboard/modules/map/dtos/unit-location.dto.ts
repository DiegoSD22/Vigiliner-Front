/**
 * Unit Location Response DTO
 * Unidad con su ubicación actual
 * Contiene todos los datos de UnitDto + ubicación con estado específico
 */

import { type LocationDto } from './location.dto';

export interface UnitLocationDto {
  // From UnitDto
  id: string;
  name: string;
  type: string;
  model?: string;
  brand?: string;
  year?: number;
  serial_number?: string;
  license_plate?: string;
  deviceId?: string;
  userId?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Map-specific
  location: LocationDto;
  status: 'MOVING' | 'IDLE' | 'OFFLINE';
  organizationId: string;
  lastSeen?: Date;
}
