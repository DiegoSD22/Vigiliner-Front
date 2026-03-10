/**
 * Mapbox Service
 * Wrapper para ngx-mapbox-gl
 * Responsabilidad: Gestionar instancia del mapa y operaciones geográficas
 * 
 * Documentación: https://github.com/Wykks/ngx-mapbox-gl
 */

import { Injectable, signal, effect } from '@angular/core';

import { LngLatBounds, type AnyLayer, type AnySourceData, type Map as MapboxMap } from 'mapbox-gl';

@Injectable({
  providedIn: 'root',
})
export class MapboxService {
  /**
   * Referencia a la instancia de Mapbox GL Map
   * Será asignada desde el componente después de inicializar ngx-mapbox-gl
   */
  private mapInstance = signal<MapboxMap | null>(null);

  /**
   * Centro visibles del mapa [lng, lat]
   */
  private center = signal<[number, number]>([-99.1332, 19.4326]); // CDMX por defecto

  /**
   * Nivel de zoom actual
   */
  private zoom = signal<number>(12);

  /**
   * Si el mapa está cargado y listo
   */
  private isLoaded = signal<boolean>(false);

  constructor() {
    // Log cuando el mapa se carga
    effect(() => {
      if (this.isLoaded()) {
        console.log('✅ Mapbox GL cargado y listo');
      }
    });
  }

  /**
   * Registra la instancia del mapa
   * Llamado desde el componente cuando ngx-mapbox-gl inicializa
   */
  setMapInstance(map: MapboxMap): void {
    this.mapInstance.set(map);
    this.isLoaded.set(true);
  }

  /**
   * Obtiene la instancia del mapa
   */
  getMapInstance(): MapboxMap | null {
    return this.mapInstance();
  }

  /**
   * Verifica si el mapa está cargado
   */
  getIsLoaded(): boolean {
    return this.isLoaded();
  }

  /**
   * Obtiene el centro actual del mapa
   */
  getCenter(): [number, number] {
    return this.center();
  }

  /**
   * Obtiene el zoom actual
   */
  getZoom(): number {
    return this.zoom();
  }

  /**
   * Navega a coordenadas específicas
   * @param lng Longitud
   * @param lat Latitud
   * @param zoom Nivel de zoom
   * @param duration Duración de la animación en ms
   */
  flyTo(lng: number, lat: number, zoom: number = 14, duration: number = 1000): void {
    const map = this.mapInstance();
    if (!map) {
      console.warn('⚠️ Mapbox no inicializado');
      return;
    }

    map.flyTo({
      center: [lng, lat],
      zoom,
      duration,
    });

    this.center.set([lng, lat]);
    this.zoom.set(zoom);
  }

  /**
   * Centra el mapa sin animación
   */
  setCenter(lng: number, lat: number): void {
    const map = this.mapInstance();
    if (!map) return;

    map.setCenter([lng, lat]);
    this.center.set([lng, lat]);
  }

  /**
   * Cambia el nivel de zoom
   */
  setZoom(zoom: number): void {
    const map = this.mapInstance();
    if (!map) return;

    map.setZoom(zoom);
    this.zoom.set(zoom);
  }

  /**
   * Ajusta los limites del mapa para enmarcar puntos
   * @param coordinates Array de [lng, lat]
   * @param padding Padding en pixels
   */
  fitBounds(coordinates: [number, number][], padding: number = 50): void {
    const map = this.mapInstance();
    if (!map || coordinates.length === 0) return;

    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
    );

    map.fitBounds(bounds, { padding });
  }

  /**
   * Agrega una fuente de datos al mapa
   */
  addSource(id: string, source: AnySourceData): void {
    const map = this.mapInstance();
    if (!map || map.getSource(id)) return;

    try {
      map.addSource(id, source);
    } catch (error) {
      console.warn(`⚠️ Error agregando source "${id}":`, error);
    }
  }

  /**
   * Elimina una fuente del mapa
   */
  removeSource(id: string): void {
    const map = this.mapInstance();
    if (!map) return;

    try {
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    } catch (error) {
      console.warn(`⚠️ Error removiendo source "${id}":`, error);
    }
  }

  /**
   * Agrega una capa al mapa
   */
  addLayer(layer: AnyLayer, beforeId?: string): void {
    const map = this.mapInstance();
    if (!map || map.getLayer(layer.id)) return;

    try {
      map.addLayer(layer, beforeId);
    } catch (error) {
      console.warn(`⚠️ Error agregando layer "${layer.id}":`, error);
    }
  }

  /**
   * Elimina una capa del mapa
   */
  removeLayer(id: string): void {
    const map = this.mapInstance();
    if (!map) return;

    try {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
    } catch (error) {
      console.warn(`⚠️ Error removiendo layer "${id}":`, error);
    }
  }

  /**
   * Limpia el mapa (opcional)
   */
  cleanup(): void {
    const map = this.mapInstance();
    if (map) {
      map.remove();
      this.mapInstance.set(null);
      this.isLoaded.set(false);
    }
  }
}
