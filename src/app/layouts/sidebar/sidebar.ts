import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitsService } from '../../modules/dashboard/units/services/units.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar{

  units$!: any;

  constructor(private unitsService: UnitsService) {
    this.units$ = this.unitsService.units$;
  }

  selectUnit(unit: any) {
    console.log('🚀 Unidad seleccionada:', unit);
    this.unitsService.selectUnit(unit);
  }
}