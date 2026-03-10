import { Component, signal, computed, ChangeDetectionStrategy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';

import { environment } from '@vigiliner/env/environment';
import { MapStateService } from '../../services/map-state.service';
import { MapMarkerService } from '../../services/map-marker.service';
import { MAPBOX_CONFIG } from '../../map.config';
import { type UnitLocationDto } from '../../dtos/unit-location.dto';

// Configurar token de Mapbox
mapboxgl.accessToken = environment.MAPBOX_API_KEY;

@Component({
  selector: 'app-admin-unit-map',
  imports: [CommonModule],
  templateUrl: './admin-unit-map.component.html',
  styleUrl: './admin-unit-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUnitMapComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private readonly mapStateService = inject(MapStateService);
  private readonly mapMarkerService = inject(MapMarkerService);
  private map: mapboxgl.Map | undefined;
  private readonly markerInstances = new Map<string, mapboxgl.Marker>();

  // Señales reactivas
  readonly markers = this.mapStateService.markers;
  readonly selectedMarkerId = this.mapStateService.selectedMarkerId;
  readonly onlineCount = this.mapStateService.onlineCount;
  readonly offlineCount = this.mapStateService.offlineCount;
  readonly idleCount = this.mapStateService.idleCount;
  readonly mapLoaded = signal(false);
  readonly legendReady = signal(false);
  readonly unitsPanelReady = signal(false);
  readonly unitsPanelOpen = signal(true);
  readonly displayMarkers = computed(() => this.markers());

  // Estado local del componente
  readonly showLegend = signal(true);
  readonly showStats = signal(true);

  constructor() {
    this.initializeMockUnits();
  }

  ngAfterViewInit(): void {
    // Garantizar que el contenedor tenga altura
    const container = this.mapContainer?.nativeElement;
    if (container) {
      const parent = container.parentElement;
      const parentHeight = parent?.offsetHeight || window.innerHeight;

      container.style.height = '100%';
      container.style.minHeight = `${parentHeight}px`;
    }

    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  /**
   * Inicializa el mapa de Mapbox GL
   */
  private initializeMap(): void {
    const container = this.mapContainer?.nativeElement;

    if (!container) {
      return;
    }

    try {
      this.map = new mapboxgl.Map({
        container: container,
        style: MAPBOX_CONFIG.DEFAULT_STYLE,
        center: MAPBOX_CONFIG.DEFAULT_CENTER as [number, number],
        zoom: MAPBOX_CONFIG.DEFAULT_ZOOM,
        pitch: 0,
        bearing: 0,
      });

      this.map.on('load', () => {
        this.map?.resize();
        this.renderMarkers();

        // Mantiene el skeleton el tiempo justo para evitar un parpadeo brusco.
        window.setTimeout(() => {
          this.mapLoaded.set(true);

          window.setTimeout(() => {
            this.unitsPanelReady.set(true);
          }, 80);

          window.setTimeout(() => {
            this.legendReady.set(true);
          }, 130);
        }, 220);
      });

      this.map.on('error', () => {
        this.mapLoaded.set(true);
        this.unitsPanelReady.set(true);
        this.legendReady.set(true);
      });
    } catch (error) {
      this.mapLoaded.set(true);
      this.unitsPanelReady.set(true);
      this.legendReady.set(true);
    }
  }

  /**
   * Renderiza los marcadores en el mapa
   */
  private renderMarkers(): void {
    if (!this.map) {
      return;
    }

    // Limpiar marcadores previos
    this.markerInstances.forEach((marker) => marker.remove());
    this.markerInstances.clear();

    // Crear nuevos marcadores
    this.markers().forEach((marker, index) => {
      const { longitude, latitude } = marker.location;

      // Crear elemento del marcador
      const markerElement = document.createElement('div');
      markerElement.className = `marker marker-${marker.status.toLowerCase()} marker-shell`;
      markerElement.style.animationDelay = `${index * 90}ms`;
      
      const color = this.getColorByStatus(marker.status);
      markerElement.innerHTML = `
        <div class="marker-pin" style="background-color: ${color}; display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          <svg class="marker-icon" style="width: 16px; height: 16px;" viewBox="0 0 20 20" fill="white">
            ${this.getIconSVG(marker.status)}
          </svg>
        </div>
      `;

      // Crear popup
      const popupContent = document.createElement('div');
      popupContent.className = 'popup-content';
      popupContent.innerHTML = `
        <div style="min-width: 192px; border-radius: 8px; background: white; padding: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <div style="font-size: 14px; font-weight: bold;">${marker.name}</div>
          <div style="font-size: 12px; opacity: 0.6;">ID: ${marker.id}</div>
          <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="padding: 4px 8px; border-radius: 4px; background-color: ${color}; color: white; font-size: 12px;">
              ${this.getStatusLabel(marker.status)}
            </span>
            <span style="padding: 4px 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 12px;">${marker.type}</span>
          </div>
          <div style="margin-top: 8px; font-size: 12px;">
            <strong>Ubicación:</strong><br />
            ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);

      // Añadir marcador al mapa
      const mglMarker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(this.map!);

      this.markerInstances.set(marker.id, mglMarker);

      // Click handler
      markerElement.addEventListener('click', () => {
        this.focusMarker(marker.id, true);
      });
    });
  }

  /**
   * Inicializa unidades mockeadas para demostración
   */
  private initializeMockUnits(): void {
    const mockUnits: UnitLocationDto[] = [
      {
        id: 'U-001',
        name: 'Unidad 01',
        status: 'MOVING',
        type: 'TRUCK',
        organizationId: 'ORG-1',
        location: { latitude: 34.0522, longitude: -118.2437 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'U-002',
        name: 'Unidad 02',
        status: 'IDLE',
        type: 'VAN',
        organizationId: 'ORG-1',
        location: { latitude: 34.0628, longitude: -118.443 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'U-003',
        name: 'Unidad 03',
        status: 'MOVING',
        type: 'TRUCK',
        organizationId: 'ORG-1',
        location: { latitude: 34.1899, longitude: -118.1271 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'U-004',
        name: 'Unidad 04',
        status: 'OFFLINE',
        type: 'CAR',
        organizationId: 'ORG-1',
        location: { latitude: 34.1025, longitude: -118.2661 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'U-005',
        name: 'Unidad 05',
        status: 'IDLE',
        type: 'TRUCK',
        organizationId: 'ORG-1',
        location: { latitude: 33.9733, longitude: -118.2489 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'U-006',
        name: 'Unidad 06',
        status: 'MOVING',
        type: 'VAN',
        organizationId: 'ORG-1',
        location: { latitude: 34.1423, longitude: -118.1479 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const markers = mockUnits.map((unit) => this.mapMarkerService.unitToMarker(unit));
    this.mapStateService.setMarkers(markers);
  }

  /**
   * Selecciona un marcador
   */
  selectMarker(markerId: string): void {
    this.mapStateService.selectMarker(markerId);
  }

  focusMarker(markerId: string, openPopup = false): void {
    const marker = this.displayMarkers().find((item) => item.id === markerId);
    if (!marker) {
      return;
    }

    this.selectMarker(markerId);

    this.map?.flyTo({
      center: [marker.location.longitude, marker.location.latitude],
      zoom: Math.max(this.map.getZoom(), 12.8),
      speed: 0.7,
      curve: 1.2,
      essential: true,
    });

    if (openPopup) {
      const markerInstance = this.markerInstances.get(markerId);
      markerInstance?.togglePopup();
    }
  }

  toggleUnitsPanel(): void {
    this.unitsPanelOpen.update((isOpen) => !isOpen);
  }

  getStatusLabel(status: string): string {
    return status === 'MOVING'
      ? 'En movimiento'
      : status === 'IDLE'
        ? 'Inactiva'
        : 'Sin conexion';
  }

  getStatusClasses(status: string): string {
    return status === 'MOVING'
      ? 'bg-success/12 text-success ring-success/20'
      : status === 'IDLE'
        ? 'bg-warning/14 text-warning ring-warning/20'
        : 'bg-error/12 text-error ring-error/20';
  }

  getUnitMetaLabel(type: string): string {
    return type === 'TRUCK'
      ? 'Camion'
      : type === 'VAN'
        ? 'Van'
        : 'Auto';
  }

  /**
   * Obtiene el color según estado
   */
  private getColorByStatus(status: string): string {
    return status === 'MOVING'
      ? '#10b981'
      : status === 'IDLE'
        ? '#f59e0b'
        : '#ef4444';
  }

  /**
   * Obtiene el SVG del ícono según estado
   */
  private getIconSVG(status: string): string {
    if (status === 'MOVING') {
      return `<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />`;
    } else if (status === 'IDLE') {
      return `<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm4 0a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V4z" clip-rule="evenodd" />`;
    } else {
      return `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`;
    }
  }

  /**
   * Obtiene la etiqueta de estado
   */
}
