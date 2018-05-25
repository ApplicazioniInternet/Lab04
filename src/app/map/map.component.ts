import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  options;
  layersControl;
  layers;
  map;
  marker;

  constructor() { }

  ngOnInit() {
    this.options = {
      layers: [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      ],
      zoom: 5,
      center: L.latLng(45.116177, 7.742615)
    };

    this.layersControl = {
      baseLayers: {
        'Open Street Map': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
        'Open Cycle Map': L.tileLayer('http://{s}.tile.opencyclemap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      },
      overlays: {
        'Big Circle': L.circle([45.116177, 7.742615], { radius: 5000 }),
        'Big Square': L.polygon([[45.116177, 7.742615], [45.116177, 7.742615], [45.116177, 7.742615], [45.116177, 7.742615]])
      }
    };

    this.layers = [
      L.circle([45.116177, 7.742615], { radius: 5000 }),
      L.polygon([[45.116177, 7.742615], [45.116177, 7.742615], [45.116177, 7.742615]]),
      L.marker([45.116177, 7.742615])
    ];
  }

  ngAfterViewInit() {
  }

}
