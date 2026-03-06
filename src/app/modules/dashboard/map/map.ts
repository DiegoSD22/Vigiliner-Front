import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-rotatedmarker';
import { UnitsService } from '../units/services/units.service';
import { UnitDto } from '../units/interfaces/units.dtos';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Tracking } from '../../../core/tracking';

declare module 'leaflet' {
  interface Marker {
    setRotationAngle(angle: number): this;
    setRotationOrigin(origin: string): this;
  }
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements AfterViewInit {

  @ViewChild('miniMapContainer')
  set miniMapContainerSetter(content: ElementRef | undefined) {
    if (content && this.backgroundTrackingEnabled) {
      this.miniMapContainer = content;
      this.initMiniMap();
    }
  }

  miniMapContainer!: ElementRef;
  @ViewChild('miniWrapper')
  miniWrapper!: ElementRef;
  @ViewChild('miniHeader')
  miniHeader!: ElementRef;
  private map!: L.Map;
  private markers: { [key: string]: L.Marker } = {};
  private units: any[] = [];
  private polylines: { [key: string]: L.Polyline } = {};
  private movingIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744465.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  private stoppedIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  private followingUnitId: string | null = null;
  private isFollowing = false;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  selectedUnit: any = null;
  activeTab: 'info' | 'stats' | 'history' = 'info';
  backgroundTrackingEnabled = false;
  miniMap!: L.Map;
  miniMarker!: L.Marker;
  isMiniMinimized = false;

  constructor(private tracking: Tracking, private unitsService: UnitsService) {}

  ngAfterViewInit(): void {

    this.map = L.map('map', {
      center: [19.4326, -99.1332], // Coordenadas de la Ciudad de México
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    /*L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);*/

    this.tracking.onLocation((data: any) => {
      console.log('📍 Nueva ubicación recibida:', data);
      this.updateMarker(data);
      this.unitsService.updateUnitStatus(data);
    });

    this.map.on('dragstart', () => {
      this.isFollowing = false;
    });
  }

  ngOnInit() {
    this.unitsService.units$.subscribe(units => {
      this.units = units;
    });

    this.unitsService.selectedUnit$.subscribe(unit => {
      if (!unit) return;

      this.followingUnitId = unit.id;
      this.isFollowing = true;

      const marker = this.markers[unit.id];
      if (!marker) return;

      const position = marker.getLatLng();

      this.map.flyTo(position, 18, {
        duration: 2,
        easeLinearity: 0.25
      });
      this.selectedUnit = unit;
    });

    this.tracking.onLocation((data: any) => {
      console.log('📍 Nueva ubicación recibida:', data);
      this.updateMarker(data);
      this.unitsService.updateUnitStatus(data);
    });
  }

  updateMarker(data: any) {
    const lat = data.lat;
    const lng = data.lng;
    const carIcon = data.speed > 5 ? this.movingIcon : this.stoppedIcon;

    if (!this.markers[data.unitId]) {
      this.markers[data.unitId] = L.marker([lat, lng], {
        icon: carIcon
      }).addTo(this.map);
      if(data.speed > 5) {
        this.markers[data.unitId].getElement()?.classList.add('pulse-marker');
      }
      return;
    }
    this.markers[data.unitId].bindTooltip(
      `🚗 ${data.speed?.toFixed(0) || 0} km/h`,
      { permanent: true, direction: 'top', className: 'vehicle-label' }
    );
    this.markers[data.unitId].setIcon(carIcon);

    if(this.isFollowing && this.followingUnitId === data.unitId) {
      this.map.panTo([lat, lng], {
        animate: true,
        duration: 1,
        easeLinearity: 0.25
      });
    }

    let color = '#9ca3af'; // Gris por defecto
    if(data.speed > 40){
      color = '#22c55e'; // Verde para MOVING
    } else if(data.speed > 5){
      color = '#eab308'; // Amarillo para STOPPED
    }
    if(!this.polylines[data.unitId]) {
      this.polylines[data.unitId] = L.polyline(
        [[lat, lng]],
        { color: color, weight: 4 }
      ).addTo(this.map);
    } else {
      this.polylines[data.unitId].setStyle({ color: color });
      this.polylines[data.unitId].addLatLng([lat, lng]);
    }

    if (this.selectedUnit && this.selectedUnit.id === data.unitId) {
      this.selectedUnit = {
        ...this.selectedUnit,
        speed: data.speed,
        status: data.status,
        lastSeen: new Date()
      };
    }

    if (this.backgroundTrackingEnabled && this.selectedUnit && this.selectedUnit.id === data.unitId && this.miniMap) {
      const marker = this.markers[data.unitId];
      if (!marker) return;

      const position = marker.getLatLng();

      this.miniMap.setView(position);
      this.miniMarker.setLatLng(position);
    }
    

    const start = this.markers[data.unitId].getLatLng();
    const end = L.latLng(lat, lng);

    const duration = 1000;
    const frames = 30;
    let frame = 0;

    const interval = setInterval(() => {

      frame++;

      const progress = frame / frames;

      const currentLat = start.lat + (end.lat - start.lat) * progress;
      const currentLng = start.lng + (end.lng - start.lng) * progress;

      if (this.markers[data.unitId]) {
        this.markers[data.unitId].setLatLng([currentLat, currentLng]);
        this.markers[data.unitId].setRotationAngle(data.heading);
      }

      if (frame >= frames) {
        clearInterval(interval);
      }

    }, duration / frames);
  }

  toggleBackgroundTracking() {
    this.backgroundTrackingEnabled = !this.backgroundTrackingEnabled;

    if (!this.backgroundTrackingEnabled) {
      this.destroyMiniMap();
    }
  }

  initMiniMap() {

    if (!this.selectedUnit) return;
    if (!this.miniMapContainer) return;

    const element = this.miniMapContainer.nativeElement;

    if (element._leaflet_id) {
      element._leaflet_id = null;
    }

    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = undefined as any;
    }

    const marker = this.markers[this.selectedUnit.id];
    if (!marker) return;

    const position = marker.getLatLng();

    this.miniMap = L.map(element, {
      center: position,
      zoom: 16,
      attributionControl: false,
      zoomControl: false
    });

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '' }
    ).addTo(this.miniMap);

    this.miniMarker = L.marker(position, {
      icon: this.movingIcon
    }).addTo(this.miniMap);

    const start = this.miniMarker.getLatLng();
    const end = position;

    const duration = 1000;
    const frames = 30;
    let frame = 0;

    const interval = setInterval(() => {

      frame++;

      const progress = frame / frames;

      const currentLat = start.lat + (end.lat - start.lat) * progress;
      const currentLng = start.lng + (end.lng - start.lng) * progress;

      this.miniMarker.setLatLng([currentLat, currentLng]);

      if (frame >= frames) {
        clearInterval(interval);
      }

    }, duration / frames);

    setTimeout(() => {
      this.miniMap.invalidateSize();
    }, 200);

    setTimeout(() => {
      this.enableDrag();
    });
  }

  destroyMiniMap() {
    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = undefined as any;
    }

    if (this.miniMapContainer) {
      const element = this.miniMapContainer.nativeElement;
      element.innerHTML = '';
    }
  }

  enableDrag() {

    const wrapper = this.miniWrapper?.nativeElement;
    const header = this.miniHeader?.nativeElement;

    if (!wrapper || !header) return;

    wrapper.style.position = 'absolute';

    header.onmousedown = (event: MouseEvent) => {

      this.isDragging = true;

      this.offsetX = event.clientX - wrapper.offsetLeft;
      this.offsetY = event.clientY - wrapper.offsetTop;

      document.onmousemove = (moveEvent: MouseEvent) => {
        if (!this.isDragging) return;

        wrapper.style.left = (moveEvent.clientX - this.offsetX) + 'px';
        wrapper.style.top = (moveEvent.clientY - this.offsetY) + 'px';
        wrapper.style.right = 'auto';
        wrapper.style.bottom = 'auto';
      };

      document.onmouseup = () => {
        this.isDragging = false;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }

  getSpeedWidth(speed: number) {
    if (!speed) return 0;
    return Math.min(speed * 2, 10);
  }


}
