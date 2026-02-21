import { Component, OnInit } from '@angular/core';
import { UnitsService } from '../../units/units';
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
    this.unitsService.selectUnit(unit);
  }
}