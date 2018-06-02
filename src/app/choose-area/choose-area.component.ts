import { Component, OnInit, OnDestroy, Input, Inject, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators, Form } from '@angular/forms';
import { MatSnackBar, MatButton, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSlider } from '@angular/material';
import { PositionForm } from './position-form';
import { PositionService } from '../position.service';
import { Position } from '../position';

@Component({
  selector: 'app-choose-area',
  templateUrl: './choose-area.component.html',
  styleUrls: ['./choose-area.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChooseAreaComponent implements OnInit, OnDestroy {
  minNumberOfVertices = 3;
  maxNumberOfVertices = 10;
  numberOfVertices = 3;
  positions: Array<PositionForm> = [];
  polygon: Array<Position> = [];

  constructor(private positionService: PositionService, public snackBar: MatSnackBar, public dialog: MatDialog) { }

  ngOnInit() {
    this.initPositionForm();

    // Metto un listener per sapere se dall'altra parte è stata aggiunta una posizione
    this.positionService.addedPosition.subscribe(position => {
      let added = false;
      let index = 0;

      this.positions.forEach(element => {
        if (index++ === this.numberOfVertices - 1 && !added && index < 10) {
          this.pushPositionForms(1);
        }

        if (element.isEmpty() && !added) {
          element.updateView(position.latitude, position.longitude);
          document.getElementById(element.id.toString() + '-latitude').focus();
          document.getElementById(element.id.toString() + '-longitude').focus();
          document.getElementById(element.id.toString() + '-longitude').blur();
          added = true;
        }
      });
    });

    // Metto un listener per sapere se dall'altra parte sono state tolte tutte le posizioni
    this.positionService.clearAllPositions.subscribe( () => {
      this.positionService.clearSavedInputPositions();
      this.resetPositionForm();
    });

    // Metto un listener per sapere se dall'altra parte è stata tolta una sola posizione
    this.positionService.removedPosition.subscribe(position => {
      this.positions.forEach(element => {
        if (element.sameCoordinates(position)) {
          element.updateView(undefined, undefined);
          document.getElementById(element.id.toString() + '-latitude').focus();
          document.getElementById(element.id.toString() + '-longitude').focus();
          document.getElementById(element.id.toString() + '-longitude').blur();

          const index = this.positions.indexOf(element, 0);
          if (index > -1 && this.positions.length > this.minNumberOfVertices) {
            this.popPositionForms(1);
          }
        }
      });
    });
  }

  ngOnDestroy() {
    // Salvo quello che ho inserito
    this.positionService.save(this.positions);
  }

  // Funzione per inizializzare il form
  initPositionForm(): void {
    this.positions = new Array();
    if (this.positionService.savedFormInstanceState()) { // Avevo salvato qualcosa prima
      for ( let i = 0; i < Math.max(this.positionService.inputPositionsFromForm.length, this.minNumberOfVertices); i++ ) {
        this.positions.push(this.positionService.inputPositionsFromForm[i]);
      }
      for (let i = 0; i < Math.max(this.positionService.inputPositionsFromForm.length, this.minNumberOfVertices); i++) {
        this.positionService.inputPositionsFromForm.pop();
      }

      this.numberOfVertices = Math.max(this.positions.length, this.minNumberOfVertices);
    } else {
      this.resetPositionForm();
    }
  }

  // Funzione per resettare il form
  resetPositionForm(): void {
    this.positions = new Array();
    this.numberOfVertices = this.minNumberOfVertices;
    for (let counter = 0; counter < this.numberOfVertices; counter++) {
      const newPositionForm = new PositionForm(counter);
      this.positions.push(newPositionForm);
    }
  }
  // Funzione per formattare il label dello slider
  formatLabel(value: number | null) {
    if (!value) {
      return this.numberOfVertices;
    }

    return value;
  }

  // Funzione per aggiungere 'n' form delle posizioni
  pushPositionForms(n: number) {
    for ( let i = 0; i < n; i++ ) {
      this.positions.push(new PositionForm(this.numberOfVertices + i));
    }

    this.numberOfVertices += n;
  }

  // Funzione per rimuovere 'n' form delle posizioni dal fondo
  popPositionForms(n: number) {
    for (let i = 0; i < n; i++) {
      const removedPosition = this.positions.pop();

      if (!removedPosition.isEmpty()) {
        this.positionService.notifyRemotion(removedPosition.positionValue);
      }
    }

    this.numberOfVertices -= n;
  }

  // Funzione chiamata quando si modifica il valore dello slider
  pitch(event: any) {
    if (this.numberOfVertices < event.value) {
      this.pushPositionForms(event.value - this.numberOfVertices);
    } else if (this.numberOfVertices > event.value) {
      this.popPositionForms(this.numberOfVertices - event.value);
    }
  }

  // Aggiunge un form
  add() {
    if (this.numberOfVertices < this.maxNumberOfVertices) {
      this.pushPositionForms(1);
    }
  }

  // Aggiunge un form
  remove() {
      if (this.numberOfVertices > this.minNumberOfVertices) {
          this.popPositionForms(1);
      }
  }

  // Funzione chiamata quando si è cliccato il fab in basso
  submit() {
    if (this.numberOfVertices > this.minNumberOfVertices && this.numberOfVertices !== this.maxNumberOfVertices) {
      this.popPositionForms(1);
    }

    if (!this.inputVerticesOk()) { // È corretto l'input
      this.openSnackBar('Devi inserire almeno 3 vertici', 'OK');
    } else if (!this.areValidVertices()) { // Sono vertici validi, ossia lo stesso vertice non è ripetuto (e disegnano una figura?)
      this.openSnackBar('Non puoi ripetere lo stesso vertice più di una volta', 'OK');
    } else {
      // Compriamo
      this.positions.forEach(element => {
        this.polygon.push(element.positionValue);
      });

      this.openDialog();
    }
  }

  // Apri la snack bar e fai vedere un messaggio con un bottoncino di fianco
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  // Funzione per controllare che l'input sia corretto
  inputVerticesOk(): boolean {
    let wrongPositions = 0;
    this.positions.forEach(element => {
      if (element.hasWrongInput()) {
        wrongPositions++;
      }
    });

    return wrongPositions === 0;
  }

  // Funzione per controllare se un singolo vertice è valido
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

  // Funzione per aprire il dialog che ti visualizza quante posizioni ci sono nell'area
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewComponent, {
      height: '250px',
      width: '250px',
      data: { polygon: this.polygon }
    });

    // Callback per quando si chiude il dialog
    dialogRef.afterClosed().subscribe(result => {
      this.positionService.notifyRemoveAllPosition();
      this.polygon = [];
    });
  }

  // Funzione che avvisa quando c'è un nuovo input
  notifyInput(formIndex: number, discriminator: string, value: number): void {
    console.log('Form index: ' + formIndex);
    if (discriminator === 'latitude') {
      if (!this.positions[formIndex].hasWrongLatitude()) {
        if (this.positions[formIndex].positionValue.latitude !== value &&
          this.positions[formIndex].positionValue.latitude !== undefined) {
          this.positionService.notifyRemotionFromForm(formIndex);
        }
        this.positions[formIndex].inputLatitude(+this.positions[formIndex].group.get(discriminator).value);
      } else {
        this.positions[formIndex].inputLatitude(undefined);
      }
    } else if (discriminator === 'longitude') {
      if (!this.positions[formIndex].hasWrongLongitude()) {
        if (this.positions[formIndex].positionValue.longitude !== value &&
            this.positions[formIndex].positionValue.longitude !== undefined) {
          this.positionService.notifyRemotionFromForm(formIndex);
        }
        this.positions[formIndex].inputLongitude(+this.positions[formIndex].group.get(discriminator).value);
      } else {
        this.positions[formIndex].inputLongitude(undefined);
      }
    }

    if (!this.positions[formIndex].isEmpty() && !this.positions[formIndex].hasWrongInput()) {
      this.positionService.notifyAdditionFromForm(this.positions[formIndex].positionValue);
    } else {
      if (this.positions[formIndex].hasWrongInput()) {
        this.positionService.notifyRemotionFromForm(formIndex);
      }
    }
  }

  // Funzione che viene chiamata quando si ha finito con un campo del form
  notify(formIndex: number, discriminator: string, event: any): void {
    this.notifyInput(formIndex, discriminator, +event.srcElement.value);
  }

  hasElementFocus(name: string): boolean {
    return document.getElementById(name) === document.activeElement;
  }
}

// Componente del dialog
@Component({
  selector: 'app-dialog-overview-example-dialog',
  templateUrl: './dialog-component.html',
  styleUrls: ['./choose-area.component.css'],
})
export class DialogOverviewComponent implements OnInit {
  counter: number;

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private positionService: PositionService) { }

  ngOnInit() {
    this.counter = this.getNumberOfPositionsInArea();
  }

  onAnnullaClick(): void {
    this.dialogRef.close();
  }

  onConfermaClick(): void {
    this.positionService.buyPositionsInArea(this.data.polygon);
    this.dialogRef.close();
  }

  getNumberOfPositionsInArea(): number {
    return this.positionService.countPositionsInPolygon(this.data.polygon);
  }

}
