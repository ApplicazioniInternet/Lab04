import { Component, OnInit, AfterViewInit, ViewEncapsulation, NgZone } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import {MatSnackBar, MatButton, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions, MatDatepickerInputEvent} from '@angular/material';
import { PositionService } from '../position.service';
import { Position } from '../position';
import { icon, latLng, marker, Marker, Polygon, tileLayer, Map, LayerGroup, latLngBounds, FeatureGroup, Control, Draw } from 'leaflet';
import { element } from 'protractor';
import {FormControl} from '@angular/forms';
import { GeoJSON } from 'geojson';

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
  drawOptions;
  shapeOptions;
  editableLayers;
  map: Map;
  polygon: Polygon = undefined;
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

    this.shapeOptions = {
      editing: {
        className: '',
      },
      stroke: true,
      color: '#fc4482',
      weight: 4,
      opacity: 0.5,
      fill: true,
      fillColor: '#fc4482',
      fillOpacity: 0.2,
      clickable: true,
      editable: false
    };

    this.drawOptions = {
      position: 'bottomleft',
      draw: {
        marker: false,
        polyline: false,
        polygon: true,
        circle: false,
        rectangle: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: this.editableLayers,
        edit: false,
        remove: true
      }
    };

    // Metto un listener per capire quando devo pulire tutta la mappa
    this.positionService.clearAllPositions.subscribe( () => {
      this.clearMap();
    });

    // Metto un listener per capire quando devo rimuovere una posizione
    this.positionService.removedPositionFromForm.subscribe(toBeRemovedMarker => {
      if (this.polygon !== undefined) {
        this.map.removeLayer(toBeRemovedMarker);
        this.tryAddPolygon();
      }
    });

    // Metto un listener per sapere se dal form c'è una posizione nuova inserita
    this.positionService.addedPositionFromForm.subscribe(() => {
      this.tryAddPolygon();
    });

    // Metto un listener per sapere se dal form c'è una posizione nuova inserita
    this.positionService.removedPositionForSale.subscribe(toBeRemovedMarker => {
        this.map.removeLayer(toBeRemovedMarker);
    });

    // Metto un listener per sapere se dal form c'è una posizione nuova inserita
    this.positionService.addedPositionForSale.subscribe(toBeAddedMarker => {
        this.map.addLayer(toBeAddedMarker);
    });
  }

  // Funzione che mi serve per salvarmi la mappa in una variabile locale quando so che è stato tutto inizializzato
  onMapReady(map: Map): void {
    this.map = map;
    this.editableLayers = new FeatureGroup();
    this.map.addLayer(this.editableLayers);

    this.positionService.getPositionsForSaleMarkers().subscribe(markers => {
      // Metto un marker per ogni posizione degli utenti presa dal database
      markers.forEach(m => {
        this.map.addLayer(m);
      });
    });

    this.map.on(Draw.Event.CREATED, this.onDrawMap, this);
    this.map.on(Draw.Event.DELETED, this.onDeleteFromMap, this);
  }

  // Funzione chiamata quando è terminato il disegno sulla mappa
  onDrawMap(e: any): void {
    // Pulisco tutto prima di iniziare in caso
    this.clearMap();
    this.positionService.notifyRemoveAllPosition();

    // Qua volendo si può estendere a disegnare un po'qualsiasi cosa, dai marker ai cerchi
    if (e.layer instanceof Polygon) {
      this.drawPolygon(e);
    }
  }

  // Funzione da chiamare quando si disegna un poligono
  drawPolygon(e: any): void {
    const arrayCoordinates: Array<Array<number>> = e.layer.toGeoJSON().geometry.coordinates; // Mi pigghio le cuurdinate bbblle
    const arrayMarkers = [];
    const arrayPositions = [];
    const latlngs = [];
    arrayCoordinates[0].forEach((point, index) => { // Pensava di fregarmi ma io lo sapevo che c'era lo 0 da mettere eheh
      if (index !== (arrayCoordinates[0].length - 1)) {
        const latitudeLongitude = latLng(point[1], point[0]); // Sono invertite nel GeoJSON
        const newPosition = new Position();
        const newMarker = marker(latitudeLongitude, { icon: this.positionService.markerIconBlue })
          .bindPopup('<b>Coordinate:</b><br>' + latitudeLongitude + '');
        newPosition.latitude = newMarker.getLatLng().lat;
        newPosition.longitude = newMarker.getLatLng().lng;

        arrayPositions.push(newPosition);
        arrayMarkers.push(newMarker);
        latlngs.push(latLng(newMarker.getLatLng().lat, newMarker.getLatLng().lng));
        this.map.addLayer(newMarker);
      }
    });
    this.polygon = new Polygon(latlngs, this.shapeOptions);
    this.map.fitBounds(this.polygon.getBounds());
    this.positionService.notifyAdditionFromMap(arrayPositions, arrayMarkers);
  }

  // Funzione chiamata quando si cancella il disegno dalla mappa
  onDeleteFromMap(e: any) {
    this.removeAllMarkers();
    this.positionService.notifyRemoveAllPosition();
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
    this.map.eachLayer((layer) => {
      if (layer instanceof Marker) {
        const m: Marker = layer;
        if (!this.positionService.canBeDeleted(m)) {
          this.map.removeLayer(layer);
        }
      }

      if (layer instanceof Polygon) {
        this.map.removeLayer(layer);
      }
    });
  }

  // Funzione per aggiugnere l'area
  tryAddPolygon(): void  {
    this.clearMap();

    if (this.positionService.polygonMarkers.length >= 3) {
      const latlngs = new Array();
      this.positionService.polygonMarkers.forEach(point => {
        this.map.addLayer(point);
        latlngs.push(point.getLatLng());
      });
      latlngs.push(latlngs[0]);
      this.polygon = new Polygon(latlngs, this.shapeOptions);
      this.polygon.redraw();
      this.editableLayers.addLayer(this.polygon);
      this.map.addLayer(this.editableLayers);
      this.map.fitBounds(this.polygon.getBounds());
    }
  }

  updateSalesMin(date: MatDatepickerInputEvent<Date>) {
    this.dateMin = date.value.valueOf();
  }

  updateSalesMax(date: MatDatepickerInputEvent<Date>) {
    this.dateMax = date.value.valueOf();
  }

  verifySales() {
    if (this.dateMin >= this.dateMax) {
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
