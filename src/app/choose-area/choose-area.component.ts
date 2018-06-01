import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, Validators, Form } from '@angular/forms';
import { MatSnackBar, MatButton } from '@angular/material';
import { PositionForm } from './position-form';
import { PositionService } from '../position.service';
import { Position } from '../position';

@Component({
  selector: 'app-choose-area',
  templateUrl: './choose-area.component.html',
  styleUrls: ['./choose-area.component.css']
})
export class ChooseAreaComponent implements OnInit {
  @ViewChild('inputLatitude') lat;
  @ViewChild('inputLongitude') lng;

  numberOfVertices = 3;
  positions: Array<PositionForm>;
  polygon: Array<Position> = [];

  constructor(private positionService: PositionService, public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.positions = new Array();
    for (let counter = 0; counter < this.numberOfVertices; counter++) {
      const newPositionForm = new PositionForm(counter);
      this.positions.push(newPositionForm);
    }

    this.positionService.addedPosition.subscribe(position => {
      console.log(position);
      let added = false;
      this.positions.forEach(element => {
        if (element.isEmpty() && !added) {
          element.positionValue.latitude = position.latitude;
          element.positionValue.longitude = position.longitude;
          console.log('Form id: ' + element.id.toString());
          element.updateView();
          document.getElementById(element.id.toString() + '-latitude').focus();
          document.getElementById(element.id.toString() + '-longitude').focus();
          document.getElementById(element.id.toString() + '-longitude').blur();
          added = true;
        }
      });
    });
  }

  formatLabel(value: number | null) { // Per formattare il label dello slider
    if (!value) {
      return this.numberOfVertices;
    }

    return value;
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
    if (this.numberOfVertices < event.value) {
      this.pushPositionForms(event.value - this.numberOfVertices);
    } else if (this.numberOfVertices > event.value) {
      this.popPositionForms(this.numberOfVertices - event.value);
    }

    this.numberOfVertices = event.value;
  }

  submit() {
    if (!this.inputVerticesOk()) { // È corretto l'input
      this.openSnackBar('Devi inserire almeno 3 vertici', 'OK');
    } else if (!this.areValidVertices()) { // Sono vertici validi, ossia lo stesso vertice non è ripetuto (e disegnano una figura?)
      this.openSnackBar('Non puoi ripetere lo stesso vertice più di una volta', 'OK');
    } else {
      // Compriamo
      this.positions.forEach(element => {
        this.polygon.push(element.positionValue);
        console.log(element.positionValue);
      });

      this.positionService.buyPositionsInArea(this.polygon);
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  inputVerticesOk(): boolean {
    let wrongPositions = 0;
    this.positions.forEach(element => {
      if (element.hasWrongInput()) {
        wrongPositions++;
      }
    });

    return wrongPositions === 0;
  }

  areValidVertices(): boolean {
    let repetition = 0;
    this.positions.forEach(element0 => {
      this.positions.forEach(element1 => {
        if (element0.sameCoordinates(element1.positionValue) && element0 !== element1) {
          repetition++;
        }
      });
    });

    return repetition === 0;
  }
}
