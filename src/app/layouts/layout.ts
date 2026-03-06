import { Component } from '@angular/core';
import { MapComponent } from "../modules/dashboard/map/map";

@Component({
  selector: 'app-layout',
  imports: [MapComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
