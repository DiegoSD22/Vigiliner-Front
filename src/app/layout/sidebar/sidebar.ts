import { Component, OnInit } from '@angular/core';
import { UnitsService } from '../../dashboard/units/services/units.service';
import { CommonModule } from '@angular/common';

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