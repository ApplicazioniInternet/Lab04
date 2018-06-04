import { Component, OnInit, AfterViewInit, ViewEncapsulation, NgZone } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {MatSnackBar, MatButton, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions, MatDatepickerInputEvent} from '@angular/material';
import { PositionService } from '../position.service';
import { Position } from '../position';
import { icon, latLng, marker, Marker, tileLayer, Map, LayerGroup, latLngBounds } from 'leaflet';
import { element } from 'protractor';
import {FormControl} from '@angular/forms';

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

  options;
  map: Map;
  dateMin: number;
  dateMax: number;
  constructor(private positionService: PositionService, public snackBar: MatSnackBar, private zone: NgZone) {
      this.dateMin = this.positionService.dateMin;
      this.dateMax = this.positionService.dateMax;
  }

  ngOnInit() {
    // Opzioni per il setup iniziale della mappa: dove è centrata, quanto è lo zoom iniziale, il tema del background
    this.options = {
      layers: [this.LAYER_OSM],
      zoom: 10,
      maxZoom: 19,
      minZoom: 1,
      center: latLng(45.116177, 7.742615),
      maxBounds: latLngBounds(latLng(90, 180), latLng(-90, -180))
    };

    // Metto un listener per capire quando devo pulire tutta la mappa
    this.positionService.clearAllPositions.subscribe( () => {
      this.clearMap();
    });

    // Metto un listener per capire quando devo rimuovere una posizione
    this.positionService.removedPositionFromForm.subscribe(toBeRemovedMarker => {
      this.map.removeLayer(toBeRemovedMarker);
    });

    // Metto un listener per sapere se dal form c'è una posizione nuova inserita
    this.positionService.addedPositionFromForm.subscribe(toBeAddedMarker => {
      this.map.addLayer(toBeAddedMarker);
    });

    // Metto un listener per sapere se dal form c'è una posizione nuova inserita
    this.positionService.removedPositionForSale.subscribe(toBeRemovedMarker => {
        this.map.removeLayer(toBeRemovedMarker);
    });

    // Metto un listener per sapere se dal form c'è una posizione nuova inserita
    this.positionService.addedPositionForSale.subscribe(toBeAddedMarker => {
        console.log(toBeAddedMarker);
        this.map.addLayer(toBeAddedMarker);
    });
  }

  // Funzione che mi serve per salvarmi la mappa in una variabile locale quando so che è stato tutto inizializzato
  onMapReady(map: Map): void {
    this.map = map;

    this.positionService.getPositionsForSaleMarkers().subscribe(markers => {
      // Metto un marker per ogni posizione degli utenti presa dal database
      markers.forEach(m => {
        this.map.addLayer(m);
      });
    });

    map.on('click', this.onMapClick, this);
  }

  // Funzione chiamata quando c'è un click sulla mappa (click per single spot, quindi non click prolungato)
  onMapClick(e): void {
    if (!this.positionService.canAddPosition()) {
      this.openSnackBar('Puoi inserire al massimo 10 vertici', 'OK');
      return;
    }

    const newPosition = new Position();
    const newMarker = marker(e.latlng, { icon: this.positionService.markerIconBlue })
      .bindPopup('<b>Coordinate:</b><br>' + e.latlng + '');
    newPosition.latitude = newMarker.getLatLng().lat;
    newPosition.longitude = newMarker.getLatLng().lng;

    this.positionService.notifyAdditionFromMap(newPosition, newMarker);
  }

  // Funzione per rimuovere l'ultimo marker che è stato aggiunto
  removeLastAddedMarker(): void {
    console.log(this.positionService.polygonMarkers.length);
    if (this.positionService.polygonMarkers.length === 0) { // Nessun marker ancora aggiunto
      return;
    }
    const removedPosition = this.removeLastMarkerFromMap();
    this.positionService.notifyRemotionFromMap(removedPosition); // Notifico anche tutti quelli che sono in ascolto su questi dati
  }

  // Funzione per rimuovere tutti i marker della mappa
  removeAllMarkers(): void {
    if (this.positionService.polygonMarkers.length === 0) {
      return;
    }
    this.clearMap();
    this.positionService.notifyRemoveAllPosition(); // Notifico tutti
  }

  // Funzione per pulire la mappa
  clearMap(): void {
    this.positionService.polygonMarkers.forEach(e => {
      this.map.removeLayer(e);
    });
  }

  // Funzione per rimuovere l'ultimo marker dalla mappa
  removeLastMarkerFromMap(): Position {
    const m = this.positionService.removeLastMarker();
    if (m === undefined) {
      return null;
    }

    this.map.removeLayer(m);

    const position = new Position();
    position.latitude = m.getLatLng().lat;
    position.longitude = m.getLatLng().lng;

    return position;
  }

  updateSalesMin(date: MatDatepickerInputEvent<Date>) {
    this.dateMin = date.value.valueOf() / 1000;
  }

  updateSalesMax(date: MatDatepickerInputEvent<Date>) {
    this.dateMax = date.value.valueOf() / 1000;
  }

  verifySales() {
    if(this.dateMin >= this.dateMax) {
      this.openSnackBar('La data di inizio deve essere minore della data di fine', 'OK');
      return;
    }
    this.positionService.verifySales(this.dateMin, this.dateMax);
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
