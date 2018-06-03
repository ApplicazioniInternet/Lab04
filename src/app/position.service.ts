import { Injectable, Output, EventEmitter } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { icon, latLng, marker, Marker, tileLayer, Map, LayerGroup } from 'leaflet';
import { Observable, of } from 'rxjs';
import { POSITIONS } from './mock-positions';
import { Position } from './position';
import { PositionForm } from './choose-area/position-form';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  ICON_URL_RED = '../assets/images/marker-icon-red.png';
  ICON_URL_BLUE = '../assets/images/marker-icon-blue.png';
  SHADOW_URL = '../assets/images/marker-shadow.png';

  minNumberOfVertices = 3;
  maxNumberOfVertices = 10;
  markerIconRed;
  markerIconBlue;
  positionsBought: Position[] = []; // Posizioni comprate
  polygonPosition: Position[] = []; // Posizioni pinnate o scritte nel form
  polygonMarkers: Marker[] = []; // Marker messi nella mappa
  buyablePositionsMarkers: Marker[] = []; // Marker delle posizioni comprabili
  inputPositionsFromForm: Array<PositionForm> = new Array();
  newPosition: Position = new Position();

  @Output() addedPositionFromMap: EventEmitter<Position> = new EventEmitter();
  @Output() addedPositionFromForm: EventEmitter<Marker> = new EventEmitter();
  @Output() removedPositionFromMap: EventEmitter<Position> = new EventEmitter();
  @Output() removedPositionFromForm: EventEmitter<Marker> = new EventEmitter();
  @Output() clearAllPositions: EventEmitter<void> = new EventEmitter();

  constructor() {
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

    POSITIONS.forEach(p => {
      const newMarker = marker(latLng(p.latitude, p.longitude),
                                { icon: this.markerIconRed })
                    .bindPopup('<b>Coordinate:</b><br>LatLng(' + p.latitude + ', ' + p.longitude + ')');
      this.buyablePositionsMarkers.push(newMarker);
    });

    this.initNewPosition();
   }

  initNewPosition(): void {
    this.newPosition = new Position();
    this.newPosition.latitude = undefined;
    this.newPosition.longitude = undefined;
  }

  getPositionsForSale(): Observable<Position[]> {
    return of(POSITIONS);
  }

  getPositionsBought(): Observable<Position[]> {
    return of(this.positionsBought);
  }

  getPositionsForSaleMarkers(): Observable<Marker[]> {
    return of(this.buyablePositionsMarkers);
  }

  notifyAdditionFromMap(newPosition: Position, newMarker: Marker): void {
    this.addedPositionFromMap.emit(newPosition);
  }

  inputFromForm(formIndex: number, discriminator: string, value: number, valid: boolean) {
    const modification = (this.polygonPosition.length === this.polygonMarkers.length &&
                          formIndex < this.polygonMarkers.length) ? true : false;
    if (discriminator === 'latitude') {
      this.newPosition.latitude = value;
    } else if (discriminator === 'longitude') {
      this.newPosition.longitude = value;
    }

    if (valid &&
        this.newPosition.latitude !== undefined &&
        this.newPosition.longitude !== undefined &&
        !this.alreadyAddedPosition(this.newPosition) &&
        !modification
      ) {
      this.notifyAdditionFromForm(this.newPosition, formIndex);
      this.initNewPosition();
    } else if (modification) {
      this.notifyRemotionFromForm(formIndex);
      if (discriminator === 'latitude') {
        this.polygonPosition[formIndex].latitude = value;
      } else if (discriminator === 'longitude') {
        this.polygonPosition[formIndex].longitude = value;
      }
      this.notifyAdditionFromForm(this.polygonPosition[formIndex], formIndex);
      this.initNewPosition();
    }
  }

  notifyAdditionFromForm(position: Position, formIndex: number): void {
    const newMarker = marker(latLng(position.latitude, position.longitude),
                              { icon: this.markerIconBlue })
                              .bindPopup('<b>Coordinate:</b><br>LatLng(' + position.latitude + ', ' + position.longitude + ')'
                            );
    this.polygonPosition[formIndex] = position;
    this.polygonMarkers[formIndex] = newMarker;
    this.addedPositionFromForm.emit(newMarker);
  }

  notifyRemoveAllPosition(): void {
    this.clearAllPositions.emit();
    this.polygonMarkers = [];
    this.polygonPosition = [];
  }

  notifyRemotionFromMap(position: Position): void {
    this.inputPositionsFromForm.pop();
    this.removedPositionFromMap.emit(position);
  }

  notifyRemotionFromForm(index: number): void {
    this.inputPositionsFromForm.pop();
    const toBeRemovedMarker = this.polygonMarkers[index];
    this.removedPositionFromForm.emit(toBeRemovedMarker);
  }

  buyPositionsInArea(polygon: Position[]) {
    this.positionsBought = new Array<Position>();
    this.getPositionsInPolygon(this.polygonPosition).forEach(element => {
      if (this.positionsBought.indexOf(element, 0) === -1) {
        this.positionsBought.push(element);
      }
    });
  }

  getPolygon(): Observable<Position[]> {
    return of(this.polygonPosition);
  }

  private isPositionsInPolygon(point: Position, polygon: Position[]): Boolean {
    const x = point.longitude;
    const y = point.latitude;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].longitude, yi = polygon[i].latitude;
        const xj = polygon[j].longitude, yj = polygon[j].latitude;

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) { inside = !inside; }
    }
    return inside;
  }

  countPositionsInPolygon(polygon: Position[]): number {
    let count = 0;

    for (const pos of POSITIONS) {
      if (this.isPositionsInPolygon(pos, polygon)) {
        count++;
      }
    }
    return count;
  }

  getPositionsInPolygon(polygon: Position[]): Position[] {
     const positionList: Position[] = new Array<Position>();

    for (const pos of POSITIONS) {
      if (this.isPositionsInPolygon(pos, polygon)) {
        positionList.push(pos);
      }
    }
    return positionList;
  }

  save(positions: Array<PositionForm>): void {
    this.inputPositionsFromForm = positions;
  }

  clearSavedInputPositions(): void {
    this.inputPositionsFromForm = new Array();
  }

  savedFormInstanceState(): boolean {
    return this.inputPositionsFromForm.length !== 0;
  }

  canAddPosition(): boolean {
    return this.polygonPosition.length !== this.maxNumberOfVertices && this.polygonMarkers.length !== this.maxNumberOfVertices;
  }

  removeLastMarker(): Marker {
    return this.polygonMarkers.pop();
  }

  alreadyAddedPosition(position: Position): boolean {
    let added = false;
    this.polygonPosition.forEach(p => {
      if (p.latitude === position.latitude && p.longitude === position.longitude) {
        added = true;
      }
    });

    return added;
  }
}
