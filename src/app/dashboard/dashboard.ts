import { Component } from '@angular/core';
import { MapComponent } from "./map/map";
import { Tracking } from '../core/tracking';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../layout/sidebar/sidebar';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MapComponent, Sidebar, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})


export class Dashboard {

  isSidebarOpen = true;
  selectedUnit: any;

  constructor(private router: Router, private tracking: Tracking) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.tracking.disconnect();
    this.router.navigate(['/login']);
  }



}
