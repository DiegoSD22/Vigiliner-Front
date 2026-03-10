import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AdminUnitMapComponent } from '../../components/admin-unit-map/admin-unit-map.component';

@Component({
  selector: 'app-admin-units-map-page',
  imports: [AdminUnitMapComponent],
  templateUrl: './admin-units-map-page.html',
  styleUrl: './admin-units-map-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUnitsMapPage {}
