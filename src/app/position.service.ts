import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { POSITIONS } from './mock-positions';
import { Position } from './position';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  positionsBought: Position[] = [];
  polygon: Position[];
  @Output() addedPosition: EventEmitter<Position> = new EventEmitter();
  newPosition: Position;

  constructor() { }

  getPositionsForSale(): Observable<Position[]> {
    return of(POSITIONS);
  }

  getPositionsBought(): Observable<Position[]> {
    return of(this.positionsBought);
  }

  notifyAddition(position: Position) {
    this.newPosition = position;
    this.addedPosition.emit(this.newPosition);
  }

  buyPositionsInArea(polygon: Position[]) {
    console.log('Compro posizioni');
    this.polygon = polygon;
    this.positionsBought = this.getPositionsInPolygon(polygon);
    this.positionsBought.forEach(element => {
      console.log(element.latitude + ' ' + element.longitude);
    });
  }

  getPolygon(): Observable<Position[]> {
    return of(this.polygon);
  }

  private isPositionsInPolygon(point: Position, polygon: Position[]): Boolean {
    const x = point.latitude;
    const y = point.longitude;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].longitude, yi = polygon[i].latitude;
        const xj = polygon[j].longitude, yj = polygon[j].latitude;

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) { inside = !inside; }
    }
    console.log('(' + x + ', ' + y + ')' + ' --- ' + inside);
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

    console.log(positionList);
    return positionList;
  }
}
