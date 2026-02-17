import { Component } from '@angular/core';
import { Map } from "../dashboard/map/map";

@Component({
  selector: 'app-layout',
  imports: [Map],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
