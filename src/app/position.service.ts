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

  
  private isPositionsInPolygon(point:Position, polygon:Position[]): Boolean {
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

  countPositionsInPolygon(polygon:Position[]): number{
    let count:number=0;
    
    for(let pos of POSITIONS){
      if(this.isPositionsInPolygon(pos, polygon)){
        count++;
      }
    }
    return count;
  }

  getPositionsInPolygon(polygon:Position[]): Position[]{
    let positionList: Position[] = new Array<Position>();

    for(let pos of POSITIONS){
      if(this.isPositionsInPolygon(pos, polygon)){
        positionList.push(pos);
      }
    }
    return positionList;
  }
}
