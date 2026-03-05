import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-rotatedmarker';
import { UnitsService } from '../units/services/units.service';
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
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {

  private map!: L.Map;
  private markers: { [key: string]: L.Marker } = {};
  private units: any[] = [];

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

    this.tracking.onLocation((data: any) => {
      console.log('📍 Nueva ubicación recibida:', data);
      this.updateMarker(data);
      this.unitsService.updateUnitStatus(data);
    });
  }

  ngOnInit() {
    // 🔹 Mantener copia local de unidades
    this.unitsService.units$.subscribe(units => {
      this.units = units;
    });

    // 🔹 Escuchar foco desde sidebar
    this.unitsService.selectedUnit$.subscribe(unit => {
      if (!unit) return;

      const marker = this.markers[unit.id];
      if (!marker) return;

      const position = marker.getLatLng();

      this.map.flyTo(position, 18, {
        duration: 2,
        easeLinearity: 0.25
      });
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
    const carIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744465.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (!this.markers[data.unitId]) {
      this.markers[data.unitId] = L.marker([lat, lng], {
        icon: carIcon
      }).addTo(this.map);
  
      return;
    }
    this.markers[data.unitId].bindTooltip(
        `🚗 ${data.speed?.toFixed(0) || 0} km/h`,
        { permanent: true, direction: 'top', className: 'vehicle-label' }
      );

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


}
