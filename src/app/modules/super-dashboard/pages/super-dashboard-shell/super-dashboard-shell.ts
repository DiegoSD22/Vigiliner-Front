import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-super-dashboard-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './super-dashboard-shell.html',
  styleUrl: './super-dashboard-shell.css',
})
export class SuperDashboardShell {}
