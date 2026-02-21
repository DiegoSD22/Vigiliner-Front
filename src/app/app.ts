import { UnitsService } from './units/units';
import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tracking } from './core/tracking';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');

  constructor(private unitsService: UnitsService, private tracking: Tracking) {}

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.tracking.connect(token);
      this.unitsService.loadMyUnits();
      this.unitsService.units$.subscribe(units => {
        if (!units || units.length === 0) return;
        units.forEach(unit => {
          this.tracking.joinUnit(unit.id);
        });
      });
    }
  }
}
