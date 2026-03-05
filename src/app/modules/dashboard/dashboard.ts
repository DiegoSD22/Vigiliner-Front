import { Component } from '@angular/core';
import { Map } from "./map/map";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Sidebar } from '../../layouts/sidebar/sidebar';
import { Tracking } from '../../core/tracking';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Map, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})


export class Dashboard {

  constructor(private router: Router, private tracking: Tracking) {}

  logout() {
    localStorage.removeItem('access_token');
    this.tracking.disconnect();
    this.router.navigate(['/login']);
  }



}
