import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { POSITIONS } from './mock-positions';
import { Position } from './position';

@Injectable({
  providedIn: 'root'
})
export class PositionService {

  constructor() { }

  getPositions(): Observable<Position[]> {
    return of(POSITIONS);
  }

  
  isPositionsInPolygon(point:Position, polygon:Position[]): Boolean {
    let x = point.longitude;
    let y = point.latitude;
    
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].longitude, yi = polygon[i].latitude;
        let xj = polygon[j].longitude, yj = polygon[j].latitude;
        
        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  }
}
