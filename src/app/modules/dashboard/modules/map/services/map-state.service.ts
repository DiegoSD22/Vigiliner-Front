/**
 * Map State Service
 * Gestiona el estado reactivo del mapa usando Signals (Angular 16+)
 * Single Source of Truth para marcadores, selecciones, etc
 */

import { Injectable, signal, computed } from '@angular/core';

import { type MapMarkerDto } from '../dtos';

@Injectable({
  providedIn: 'root',
})
export class MapStateService {
  /**
   * Lista de marcadores de unidades en el mapa
   */
  readonly markers = signal<MapMarkerDto[]>([]);

  /**
   * ID de la unidad seleccionada actualmente
   */
  readonly selectedMarkerId = signal<string | null>(null);

  /**
   * Indica si se está cargando data
   */
  readonly isLoading = signal<boolean>(false);

  /**
   * Mensaje de error (si existe)
   */
  readonly error = signal<string | null>(null);

  /**
   * Marcador seleccionado (computed)
   */
  readonly selectedMarker = computed(() => {
    const selectedId = this.selectedMarkerId();
    return this.markers().find((m) => m.id === selectedId) || null;
  });

  /**
   * Cantidad de marcadores en movimiento
   */
  readonly onlineCount = computed(() => {
    return this.markers().filter((m) => m.status === 'MOVING').length;
  });

  /**
   * Cantidad de marcadores sin conexión
   */
  readonly offlineCount = computed(() => {
    return this.markers().filter((m) => m.status === 'OFFLINE').length;
  });

  /**
   * Cantidad de marcadores inactivos
   */
  readonly idleCount = computed(() => {
    return this.markers().filter((m) => m.status === 'IDLE').length;
  });

  /**
   * Actualiza la lista completa de marcadores
   */
  updateMarkers(markers: MapMarkerDto[]): void {
    this.markers.set(markers);
    this.error.set(null);
  }

  /**
   * Alias para updateMarkers (nomenclatura alternativa)
   */
  setMarkers(markers: MapMarkerDto[]): void {
    this.updateMarkers(markers);
  }

  /**
   * Agrega un nuevo marcador
   */
  addMarker(marker: MapMarkerDto): void {
    const current = this.markers();
    if (!current.find((m) => m.id === marker.id)) {
      this.markers.set([...current, marker]);
    }
  }

  /**
   * Actualiza un marcador existente
   */
  updateMarker(id: string, updates: Partial<MapMarkerDto>): void {
    const current = this.markers();
    this.markers.set(
      current.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }

  /**
   * Elimina un marcador
   */
  removeMarker(id: string): void {
    this.markers.set(this.markers().filter((m) => m.id !== id));
    if (this.selectedMarkerId() === id) {
      this.selectedMarkerId.set(null);
    }
  }

  /**
   * Selecciona un marcador
   */
  selectMarker(id: string | null): void {
    this.selectedMarkerId.set(id);
  }

  /**
   * Establece estado de carga
   */
  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  /**
   * Establece un error
   */
  setError(error: string | null): void {
    this.error.set(error);
  }

  /**
   * Limpia todo el estado
   */
  clear(): void {
    this.markers.set([]);
    this.selectedMarkerId.set(null);
    this.isLoading.set(false);
    this.error.set(null);
  }
}
