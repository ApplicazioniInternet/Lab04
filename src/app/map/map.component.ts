import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MatSnackBar, MatButton, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material';
import { PositionService } from '../position.service';
import { Position } from '../position';
import {icon, latLng, marker, Marker, tileLayer, Map, LayerGroup} from 'leaflet';
import { PositionForm } from '../choose-area/position-form';
import { MapMarker } from './map-marker';

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
  // Coordinate di Torino [45.116177, 7.742615] se ci interessa

  LAYER_OSM = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
  ICON_URL_RED = '../assets/images/marker-icon-red.png';
  ICON_URL_BLUE = '../assets/images/marker-icon-blue.png';
  SHADOW_URL = '../assets/images/marker-shadow.png';

  options;
  vertices: LayerGroup;
  markers: Marker[] = [];
  polygon: MapMarker[] = [];
  positions: Position[];
  markerIconRed;
  markerIconBlue;
  map: Map;
  index: number;

  constructor(private positionService: PositionService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.index = 0;
    this.positionService.getPositionsForSale().subscribe(positions => this.positions = positions);

    // Marker per le posizioni degli utenti che sono sulla mappa
    this.markerIconRed = icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [0, -38],
      iconUrl: this.ICON_URL_RED,
      shadowUrl: this.SHADOW_URL
    });

    // Marker per i punti che vado ad aggiungere io cliccando sulla mappa
    this.markerIconBlue = icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [0, -38],
      iconUrl: this.ICON_URL_BLUE,
      shadowUrl: this.SHADOW_URL
    });

    // Opzioni per il setup iniziale della mappa: dove è centrata, quanto è lo zoom iniziale, il tema del background
    this.options = {
      layers: [this.LAYER_OSM],
      zoom: 10,
      center: latLng(45.116177, 7.742615)
    };

    // Metto un marker per ogni posizione degli utenti presa dal database
    this.positions.forEach((element) => {
      this.markers.push(marker(latLng(element.latitude, element.longitude),
                              { icon: this.markerIconRed })
                        .bindPopup('<b>Coordinate:</b><br>LatLng(' + element.latitude + ', ' + element.longitude + ')')
                        );
    });

    // // Metto un listener per capire quando devo pulire tutta la mappa
    // this.positionService.clearAllPositions.subscribe( () => {
    //   this.clearMap();
    // });

    // // Metto un listener per capire quando devo rimuovere una posizioneß
    // this.positionService.removedPosition.subscribe(position => {
    //   let markerToBeRemoved;
    //   this.polygon.forEach(element => {
    //     if (element.getLatLng().lat === position.latitude && element.getLatLng().lng === position.longitude) {
    //       markerToBeRemoved = position;
    //         console.log(position);
    //     }
    //
    //     return;
    //   });
    //
    //   this.removeMarker(markerToBeRemoved);
    // });

      // Metto un listener per sapere se dall'altra parte è stata tolta una sola posizione
      this.positionService.removedPositionForm.subscribe(position => {
          this.positions.forEach(element => {
              console.log(position);
              if (element.id === position.id) {
                  this.removeMarkerByPosition(position.positionValue);
              }
          });
      });

  }

  // Funzione che mi serve per salvarmi la mappa in una variabile locale quando so che è stato tutto inizializzato
  onMapReady(map: Map): void {
    this.map = map;
    map.on('click', this.onMapClick, this);
  }

  // Funzione chiamata quando c'è un click sulla mappa (click per single spot, quindi non click prolungato)
  onMapClick(e): void {
    const newPosition = new Position(this.index++);
    const newMarker = new MapMarker(newPosition.id, e.latlng, { icon: this.markerIconBlue })
      .bindPopup('<b>Coordinate:</b><br>' + e.latlng + '');
    console.log(newMarker);
    this.map.addLayer(newMarker);
    newPosition.latitude = newMarker.getLatLng().lat;
    newPosition.longitude = newMarker.getLatLng().lng;

    this.positionService.notifyAddition(newPosition);
    this.polygon.push(newMarker);
  }

  // Funzione per rimuovere l'ultimo marker che è stato aggiunto
  removeLastAddedMarker(): void {
    if (this.polygon.length === 0) {
      return;
    }
    const removedPosition = this.removeLastMarkerFromMap();
    this.positionService.notifyRemotion(removedPosition); // Notifico anche tutti quelli che sono in ascolto su questi dati
  }

  // Funzione per rimuovere tutti i marker della mappa
  removeAllMarkers(): void {
    if (this.polygon.length === 0) {
      return;
    }
    this.clearMap();
    this.positionService.notifyRemoveAllPosition(); // Notifico tutti
  }

  // Funzione per pulire la mappa
  clearMap(): void {
    this.polygon.forEach(element => {
      this.map.removeLayer(element);
    });

    this.polygon = [];
  }

  // Funzione per rimuovere l'ultimo marker dalla mappa
  removeLastMarkerFromMap(): Position {
    const m = this.polygon.pop();
    return this.removeMarker(m);
  }

  // Funzione per rimuovere un marker dalla mappa
  removeMarker(m: MapMarker): Position {
    if (m === undefined) {
      return null;
    }

    this.map.removeLayer(m);

    const position = new Position(0);
    position.latitude = m.getLatLng().lat;
    position.longitude = m.getLatLng().lng;

    return position;
  }

  removeMarkerByPosition(positionForm: PositionForm) {
    this.polygon.forEach(element => {
        console.log(element);
      if (element.id === positionForm.id) {
          this.map.removeLayer(element);
      }
    });
    return;
  }
}
