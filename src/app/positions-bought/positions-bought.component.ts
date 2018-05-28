import { Component, OnInit } from '@angular/core';
import { Position } from '../position';
import { PositionService } from '../position.service';

@Component({
  selector: 'app-positions-bought',
  templateUrl: './positions-bought.component.html',
  styleUrls: ['./positions-bought.component.css']
})
export class PositionsBoughtComponent implements OnInit {
  positions: Position[];
  panelOpenState: boolean;

  constructor(private positionService: PositionService) {
    this.panelOpenState = false;
  }

  ngOnInit() {
    this.getPositions();
  }

  getPositions(): void {
    this.positionService // Questo sarà il servizio che si collegherà al nostro server
      .getPositions() // Funzione per prendere le posizioni, ritorna un Observable perché la chiamatas sarà asincrona
      .subscribe(positions => this.positions = positions); // Essendo la cosa asincrona dobbiamo registrare una funzione
  }

}
