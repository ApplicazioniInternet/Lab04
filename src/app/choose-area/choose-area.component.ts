import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, Form } from '@angular/forms';
import { PositionForm } from './positionForm';
import { PositionService } from '../position.service';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-choose-area',
  templateUrl: './choose-area.component.html',
  styleUrls: ['./choose-area.component.css']
})
export class ChooseAreaComponent implements OnInit {
  numberOfVertices = 3;
  positions: Array<PositionForm> = new Array(this.numberOfVertices).fill(new PositionForm);

  constructor(private positionService: PositionService) {
  }

  ngOnInit() {
  }

  formatLabel(value: number | null) { // Per formattare il label dello slider
    if (!value) {
      return this.numberOfVertices;
    }

    return value;
  }

  counter(size: number) {
    return new Array(size).fill(0).map((x, i) => i);
  }

  pitch(event: any) {
    this.numberOfVertices = event.value;
    this.positions.push( new PositionForm() );
  }
}
