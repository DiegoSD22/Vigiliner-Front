import { UnitsService } from './../units/units';
import { Component } from '@angular/core';
import { Map } from "./map/map";
import { Tracking } from '../core/tracking';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../layout/sidebar/sidebar';
import { Router } from '@angular/router';

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
