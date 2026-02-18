import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Tracking } from '../../core/tracking';
import 'leaflet-rotatedmarker';

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
  private marker: L.Marker | null = null;

  constructor(private tracking: Tracking) {}

  ngAfterViewInit(): void {

    this.map = L.map('map', {
      center: [19.4326, -99.1332], // Coordenadas de la Ciudad de México
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.tracking.connect('b718240b-9007-42b1-802c-e1612f5467a2'); //ID provisional
    this.tracking.onLocation((data) => {
      this.updateMarker(data);
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

    if (!this.marker) {
      this.marker = L.marker([lat, lng], {
        icon: carIcon
      }).addTo(this.map);
      return;
    }

    const start = this.marker.getLatLng();
    const end = L.latLng(lat, lng);

    const duration = 1000;
    const frames = 30;
    let frame = 0;

    const interval = setInterval(() => {

      frame++;

      const progress = frame / frames;

      const currentLat = start.lat + (end.lat - start.lat) * progress;
      const currentLng = start.lng + (end.lng - start.lng) * progress;

      if (this.marker) {
        this.marker.setLatLng([currentLat, currentLng]);
        this.marker.setRotationAngle(data.heading);
      }

      if (frame >= frames) {
        clearInterval(interval);
      }

    }, duration / frames);
  }


}
