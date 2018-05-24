import { Component, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  showFiller = false;
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    center: L.latLng(45.116177, 7.742615)
  };

  layersControl = {
    baseLayers: {
      'Open Street Map': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'Open Cycle Map': L.tileLayer('http://{s}.tile.opencyclemap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    },
    overlays: {
      'Big Circle': L.circle([46.95, -122], { radius: 5000 }),
      'Big Square': L.polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]])
    }
  };

  layers = [
    L.circle([46.95, -122], { radius: 5000 }),
    L.polygon([[46.8, -121.85], [46.92, -121.92], [46.87, -121.8]]),
    L.marker([46.879966, -121.726909])
  ];

  /*map = L.map('map-id');
  marker = L.marker([45.116177, 7.742615])
            .bindPopup('<b>Hello world!</b><br>I am a popup.')
            .openPopup()
            .addTo(this.map);*/
}
