import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, Form } from '@angular/forms';
import { PositionForm } from './position-form';
import { PositionService } from '../position.service';
import { Position } from '../position';
import { Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar, MatButton } from '@angular/material';

@Component({
  selector: 'app-choose-area',
  templateUrl: './choose-area.component.html',
  styleUrls: ['./choose-area.component.css']
})
export class ChooseAreaComponent implements OnInit {
  numberOfVertices = 3;
  positions: Array<PositionForm>;

  constructor(private positionService: PositionService, public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.positions = new Array();
    for (let counter = 0; counter < this.numberOfVertices; counter++) {
      this.positions.push(new PositionForm(counter + 1));
    }
  }

  formatLabel(value: number | null) { // Per formattare il label dello slider
    if (!value) {
      return this.numberOfVertices;
    }

    return value;
  }

  getPositionAtIndex(i: number) {
    return this.positions[i];
  }

  pushPositionForms(n: number) {
    for ( let i = 0; i < n; i++ ) {
      this.positions.push(new PositionForm(this.numberOfVertices + i));
    }
  }

  popPositionForms(n: number) {
    for (let i = 0; i < n; i++) {
      this.positions.pop();
    }
  }

  pitch(event: any) {
    console.log(event.value + ' ' + this.numberOfVertices);
    if (this.numberOfVertices < event.value) {
      this.pushPositionForms(event.value - this.numberOfVertices);
    } else if (this.numberOfVertices > event.value) {
      this.popPositionForms(this.numberOfVertices - event.value);
    }

    this.numberOfVertices = event.value;
  }

  submit() {
    let i = 0;
    this.positions.forEach(element => {
      console.log('Position #' + i++ + ' ' + element.positionValue.latitude + ' ' + element.positionValue.longitude);
    });

    if (this.inputVerticesOk() !== true) {
      this.openSnackBar('Devi inserire almeno 3 vertici', 'OK');
    } else {
      // Salviamo
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  inputVerticesOk() {
    this.positions.forEach(element => {
      if (this.isValidVertex(element.positionValue) !== true) {
        return false;
      }
    });
    return true;
  }

  isValidVertex(position: Position) {
    if (position == null) {
      return false;
    }

    this.positions.forEach(element => {
      if (element.sameCoordinates(position)) {
        return false;
      }
    });
  }
}
