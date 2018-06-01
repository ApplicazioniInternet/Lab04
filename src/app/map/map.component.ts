import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MatSnackBar, MatButton, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material';
import { PositionService } from '../position.service';
import { Position } from '../position';
import { icon, latLng, marker, Marker, tileLayer, Map, LayerGroup } from 'leaflet';

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 100,
  touchendHideDelay: 100,
};

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }
  ],
})
export class MapComponent implements OnInit {
  // Coordinate di Torino [45.116177, 7.742615]

  LAYER_OSM = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
  ICON_URL_RED = '../assets/images/marker-icon-red.png';
  ICON_URL_BLUE = '../assets/images/marker-icon-blue.png';
  SHADOW_URL = '../assets/images/marker-shadow.png';

  options;
  vertices: LayerGroup;
  markers: Marker[] = [];
  polygon: Marker[] = [];
  positions: Position[];
  markerIconRed;
  markerIconBlue;
  map: Map;

  constructor(private positionService: PositionService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.positionService.getPositionsForSale().subscribe(positions => this.positions = positions);
    this.markerIconRed = icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [0, -38],
      iconUrl: this.ICON_URL_RED,
      shadowUrl: this.SHADOW_URL
    });

    this.markerIconBlue = icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [0, -38],
      iconUrl: this.ICON_URL_BLUE,
      shadowUrl: this.SHADOW_URL
    });

    this.options = {
      layers: [this.LAYER_OSM],
      zoom: 10,
      center: latLng(45.116177, 7.742615)
    };

    this.positions.forEach((element) => {
      this.markers.push(marker(latLng(element.latitude, element.longitude),
                              { icon: this.markerIconRed })
                        .bindPopup('<b>Coordinate:</b><br>LatLng(' + element.latitude + ', ' + element.longitude + ')')
                        );
    });
  }

  onMapReady(map: Map): void {
    this.map = map;
    map.on('click', this.onMapClick, this);
  }

  onMapClick(e): void {
    const newPosition = new Position();
    const newMarker = marker(e.latlng, { icon: this.markerIconBlue })
      .bindPopup('<b>Coordinate:</b><br>' + e.latlng + '');
    this.map.addLayer(newMarker);
    newPosition.latitude = newMarker.getLatLng().lat;
    newPosition.longitude = newMarker.getLatLng().lng;

    this.positionService.notifyAddition(newPosition);
    this.polygon.push(newMarker);

    console.log(this.polygon.length);
  }

  removeLastAddedMarker(): void {
    if (this.polygon.length === 0) {
      return;
    }
    const m = this.polygon.pop();
    this.map.removeLayer(m);
  }

  removeAllMarkers(): void {
    if (this.polygon.length === 0) {
      return;
    }
    this.polygon.forEach(element => {
      this.map.removeLayer(element);
    });

    this.polygon = [];
  }
}
