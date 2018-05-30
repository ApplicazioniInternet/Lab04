import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, Form } from '@angular/forms';
import { PositionForm } from './position-form';
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

  getPositions(size: number) {
    return this.positions.slice(0, size);
  }

  pushPositionForms(n: number) {
    for ( let i = 0; i < n; i++ ) {
      this.positions.push(new PositionForm);
    }
  }

  popPositionForms(n: number) {
    this.positions.slice(0, this.numberOfVertices - n - 1 );
  }

  pitch(event: any) {
    if (this.numberOfVertices < event.value) {
      this.pushPositionForms(event.value - this.numberOfVertices);
    } else if (this.numberOfVertices > event.value) {
      this.popPositionForms(this.numberOfVertices - event.value);
    }

    this.numberOfVertices = event.value;
  }

  submit() {
    let i = 0;
    for (const position of this.positions) {
      if ( i++ >= this.numberOfVertices ) {
        return;
      }
      console.log(position.positionValue.latitude + ' ' + position.positionValue.longitude);
    }
  }
}
