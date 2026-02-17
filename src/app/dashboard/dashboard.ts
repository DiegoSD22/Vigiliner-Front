import { Component } from '@angular/core';
import { Map } from "./map/map";

@Component({
  selector: 'app-dashboard',
  imports: [Map],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

}
