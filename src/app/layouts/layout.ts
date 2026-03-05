import { Component } from '@angular/core';
import { Map } from '../modules/dashboard/map/map';

@Component({
  selector: 'app-layout',
  imports: [Map],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
