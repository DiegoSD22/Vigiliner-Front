/**
 * Map Marker Service
 * Gestiona la creación y actualización de marcadores
 * Convierte data de unidades a formato de marcador para el mapa
 */

import { Injectable } from '@angular/core';

import { type UnitLocationDto } from '../dtos/unit-location.dto';
import { type MapMarkerDto } from '../dtos';

@Injectable({
  providedIn: 'root',
})
export class MapMarkerService {
  /**
   * Colores por estado de unidad
   */
  private readonly statusColors: Record<'MOVING' | 'OFFLINE' | 'IDLE', string> = {
    MOVING: '#10b981',    // Green
    OFFLINE: '#6b7280',   // Gray
    IDLE: '#f59e0b',      // Amber
  };

  /**
   * Iconos por tipo de unidad (meri-icons o custom)
   */
  private readonly typeIcons: Record<string, string> = {
    TRUCK: 'truck',
    VAN: 'van',
    CAR: 'car',
    MOTOCICLETA: 'two-wheeler',
    default: 'location-on',
  };

  /**
   * Convierte una unidad con ubicación a un marcador mapeable
   */
  unitToMarker(unit: UnitLocationDto): MapMarkerDto {
    const unitType = unit.type || 'default';

    return {
      id: unit.id,
      name: unit.name,
      location: unit.location,
      status: unit.status,
      type: unitType,
      speed: 0,
      heading: undefined,
      color: this.statusColors[unit.status as 'MOVING' | 'OFFLINE' | 'IDLE'] || '#6b7280',
      icon: this.typeIcons[unitType] || this.typeIcons['default'],
      lastSeen: unit.lastSeen,
      metadata: {
        brand: undefined,
        model: undefined,
        licensePlate: undefined,
        year: undefined,
      },
    };
  }

  /**
   * Convierte múltiples unidades a marcadores
   */
  unitsToMarkers(units: UnitLocationDto[]): MapMarkerDto[] {
    return units.map((unit) => this.unitToMarker(unit));
  }

  /**
   * Calcula color basado en velocidad
   * Verde: en movimiento importante, Amarillo: en movimiento leve, Gris: detenido
   */
  getColorBySpeed(speed: number): string {
    if (speed > 20) return '#10b981'; // Verde - Moving
    if (speed > 5) return '#f59e0b';  // Amarillo - Slow
    return '#6b7280';                  // Gris - Stopped
  }

  /**
   * Obtiene la descripción del estado
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      MOVING: 'En movimiento',
      OFFLINE: 'Sin conexión',
      IDLE: 'Inactiva',
    };
    return labels[status] || status;
  }

  /**
   * Obtiene el emoji para el tipo de unidad
   */
  getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      TRUCK: '🚚',
      VAN: '🚐',
      CAR: '🚗',
      MOTOCICLETA: '🏍️',
      default: '🚙',
    };
    return emojis[type] || emojis['default'];
  }
}
