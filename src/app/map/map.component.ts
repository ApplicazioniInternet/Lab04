import { Component, OnInit, AfterViewInit, ViewEncapsulation, NgZone } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MatSnackBar, MatButton, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material';
import { PositionService } from '../position.service';
import { Position } from '../position';
import { icon, latLng, marker, Marker, tileLayer, Map, LayerGroup } from 'leaflet';
import { element } from 'protractor';

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
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit {
  // Coordinate di Torino [45.116177, 7.742615] se ci interessa

  LAYER_OSM = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
  ICON_URL_RED = '../assets/images/marker-icon-red.png';
  ICON_URL_BLUE = '../assets/images/marker-icon-blue.png';
  SHADOW_URL = '../assets/images/marker-shadow.png';

  options;
  markers: Marker[] = [];
  polygon: Marker[] = [];
  positions: Position[];
  markerIconRed;
  markerIconBlue;
  map: Map;

  constructor(private positionService: PositionService, public snackBar: MatSnackBar, private zone: NgZone) { }

  ngOnInit() {
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
    this.positions.forEach(e => {
      this.markers.push(marker(latLng(e.latitude, e.longitude),
                              { icon: this.markerIconRed })
                        .bindPopup('<b>Coordinate:</b><br>LatLng(' + e.latitude + ', ' + e.longitude + ')')
                        );
    });

    // Metto un listener per capire quando devo pulire tutta la mappa
    this.positionService.clearAllPositions.subscribe( () => {
      this.clearMap();
    });

    // Metto un listener per capire quando devo rimuovere una posizione
    this.positionService.removedPositionFromForm.subscribe(index => {
      const newPolygon: Marker[] = [];
      for (let i = 0; i < this.polygon.length; i++) {
        if (i === index && this.polygon[i] !== undefined) {
          this.removeMarker(this.polygon[i]);
        } else {
          newPolygon.push(this.polygon[i]);
        }
      }

      this.polygon = newPolygon;
    });

    // Metto un listener per sapere se dal form c'è una posizione nuova inserita
    this.positionService.addedPositionFromForm.subscribe(position => {
      const newMarker = marker(latLng(position.latitude, position.longitude),
        { icon: this.markerIconBlue })
        .bindPopup('<b>Coordinate:</b><br>LatLng(' + position.latitude + ', ' + position.longitude + ')');
      console.log('Chiamato ' + this.polygon.indexOf(newMarker));
      let alreadyPresent = false;

      this.polygon.forEach( m => {
        if (m.getLatLng().lat === newMarker.getLatLng().lat &&
            m.getLatLng().lng === newMarker.getLatLng().lng) {
              alreadyPresent = true;
          }
      });

      if (!alreadyPresent) {
        this.polygon.push(newMarker);
        this.map.addLayer(newMarker);
      }
    });
  }

  // Funzione che mi serve per salvarmi la mappa in una variabile locale quando so che è stato tutto inizializzato
  onMapReady(map: Map): void {
    this.map = map;
    map.on('click', this.onMapClick, this);
  }

  // Funzione chiamata quando c'è un click sulla mappa (click per single spot, quindi non click prolungato)
  onMapClick(e): void {
    if (this.polygon.length === 10) {
      this.openSnackBar('Puoi inserire al massimo 10 vertici', 'OK');
      return;
    }

    const newPosition = new Position();
    const newMarker = marker(e.latlng, { icon: this.markerIconBlue })
      .bindPopup('<b>Coordinate:</b><br>' + e.latlng + '');
    newPosition.latitude = newMarker.getLatLng().lat;
    newPosition.longitude = newMarker.getLatLng().lng;

    this.map.addLayer(newMarker);
    this.polygon.push(newMarker);
    this.positionService.notifyAddition(newPosition);
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
    this.polygon.forEach(e => {
      this.map.removeLayer(e);
    });

    this.polygon = [];
  }

  // Funzione per rimuovere l'ultimo marker dalla mappa
  removeLastMarkerFromMap(): Position {
    const m = this.polygon.pop();
    return this.removeMarker(m);
  }

  // Funzione per rimuovere un marker dalla mappa
  removeMarker(m: Marker): Position {
    if (m === undefined) {
      return null;
    }

    this.map.removeLayer(m);

    const position = new Position();
    position.latitude = m.getLatLng().lat;
    position.longitude = m.getLatLng().lng;

    return position;
  }

  // Apri la snack bar e fai vedere un messaggio con un bottoncino di fianco
  openSnackBar(message: string, action: string) {
    this.zone.run(() => {
      this.snackBar.open(message, action, {
        duration: 2000,
      });
    });
  }
}
