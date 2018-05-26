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
}
