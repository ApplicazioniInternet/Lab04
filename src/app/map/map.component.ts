import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MatSnackBar, MatButton } from '@angular/material';
import { PositionService } from '../position.service';
import { Position } from '../position';
import { icon, latLng, marker, Marker, tileLayer, Map, LayerGroup } from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  // Coordinate di Torino [45.116177, 7.742615]

  LAYER_OSM = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
  ICON_URL = '../assets/images/marker-icon.png';
  SHADOW_URL = '../assets/marker-shadow.png';

  options;
  vertices: LayerGroup;
  markers: Marker[] = [];
  positions: Position[];
  markerIcon;
  map: Map;

  constructor(private positionService: PositionService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.positionService.getPositions().subscribe(positions => this.positions = positions);
    this.markerIcon = icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [0, -38],
      iconUrl: this.ICON_URL,
      shadowUrl: this.SHADOW_URL
    });

    this.options = {
      layers: [this.LAYER_OSM],
      zoom: 10,
      center: latLng(45.116177, 7.742615)
    };

    this.positions.forEach((element) => {
      this.markers.push(marker(latLng(element.latitude, element.longitude),
                              { icon: this.markerIcon })
                        .bindPopup('<b>Coordinate:</b><br>LatLng(' + element.latitude + ', ' + element.longitude + ')')
                        );
    });
  }

  onMapReady(map: Map) {
    this.map = map;
    map.on('click', this.onMapClick, this);
  }

  onMapClick(e) {
    const newMarker = marker(e.latlng, { icon: this.markerIcon })
      .bindPopup('<b>Coordinate:</b><br>' + e.latlng + '');
    this.map.addLayer(newMarker);
  }
}
