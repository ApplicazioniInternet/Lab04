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
  positions: Array<PositionForm> = [];
  numberOfVertices = 3;

  constructor(private positionService: PositionService, public snackBar: MatSnackBar, public dialog: MatDialog) { }

  ngOnInit() {
    this.initPositionForm();

    // Metto un listener per sapere se dall'altra parte è stata aggiunta una posizione
    this.positionService.addedPositionFromMap.subscribe(addedPosition => {
      this.getIndexEmptyForm();
      this.addFormWithPosition(addedPosition);
    });

    // Metto un listener per sapere se dall'altra parte sono state tolte tutte le posizioni
    this.positionService.clearAllPositions.subscribe( () => {
      this.positionService.clearSavedInputPositions();
      this.resetPositionForm();
    });

    // Metto un listener per sapere se dall'altra parte è stata tolta una sola posizione
    this.positionService.removedPositionFromMap.subscribe(position => {
      if (this.getNumberOfNotEmptyForms() > this.positionService.minNumberOfVertices) {
        this.positions.pop();
        this.numberOfVertices--;
      } else {
        this.positions[this.getNumberOfNotEmptyForms() - 1].updateView(undefined, undefined);
      }
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
      for ( let i = 0; i < Math.max(this.positionService.inputPositionsFromForm.length, this.positionService.minNumberOfVertices); i++ ) {
        this.positions.push(this.positionService.inputPositionsFromForm[i]);
      }
      for (let i = 0; i < Math.max(this.positionService.inputPositionsFromForm.length, this.positionService.minNumberOfVertices); i++) {
        this.positionService.inputPositionsFromForm.pop();
      }

      this.numberOfVertices = Math.max(this.positions.length, this.positionService.minNumberOfVertices);
    } else {
      this.resetPositionForm();
    }
  }

  // Funzione per resettare il form
  resetPositionForm(): void {
    this.positions = new Array();
    this.numberOfVertices = this.positionService.minNumberOfVertices;
    for (let counter = 0; counter < this.numberOfVertices; counter++) {
      const newPositionForm = new PositionForm(counter);
      this.positions.push(newPositionForm);
    }
  }

  getNumberOfVertices(): number {
    return this.numberOfVertices;
  }

  addFormWithPosition(position: Position): void {
    if (this.numberOfVertices - this.getNumberOfNotEmptyForms() === 1) {
      this.pushPositionForms(1);
    }

    let indexEmptyForm = this.getIndexEmptyForm();
    console.log(indexEmptyForm);
    const pf = (indexEmptyForm === -1) ? new PositionForm(this.numberOfVertices + 1) : this.positions[indexEmptyForm];

    if (indexEmptyForm === -1 && this.positionService.canAddPosition()) {
      indexEmptyForm = this.positions.length - 1;
    }

    this.positions[indexEmptyForm].updateView(position.latitude, position.longitude);

    document.getElementById(indexEmptyForm + '-latitude').focus();
    document.getElementById(indexEmptyForm + '-longitude').focus();
    document.getElementById(indexEmptyForm + '-longitude').blur();
  }

  getNumberOfNotEmptyForms(): number {
    let i = -1;
    let found = false;
    this.positions.forEach((p, index) => {
      if (p.isEmpty() && !found) {
        i = index;
        found = true;
      }
    });

    return i;
  }

  getIndexEmptyForm(): number {
    let index = -1, i = 0;
    let found = false;
    this.positions.forEach(form => {
      if (form.isEmpty() && !found) {
        index = i;
        found = true;
      }
      i++;
    });

    return index;
  }

  // Funzione per formattare il label dello slider
  formatLabel(value: number | null) {
    if (!value) {
      return this.getNumberOfVertices();
    }

    return value;
  }

  // Funzione per aggiungere 'n' form delle posizioni
  pushPositionForms(n: number) {
    if (this.numberOfVertices === this.positionService.maxNumberOfVertices) {
      return;
    }
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
        this.positionService.notifyRemotionFromForm(removedPosition.id);
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
    if (this.numberOfVertices < this.positionService.maxNumberOfVertices) {
      this.pushPositionForms(1);
    }
  }

  // Rimuove un form
  remove() {
    if (this.numberOfVertices > this.positionService.minNumberOfVertices) {
        this.popPositionForms(1);
    }
  }

  // Funzione chiamata quando si è cliccato il fab in basso
  submit() {
    if (this.numberOfVertices > this.positionService.minNumberOfVertices &&
        this.numberOfVertices !== this.positionService.maxNumberOfVertices) {
      this.popPositionForms(1);
    }

    if (!this.inputVerticesOk()) { // È corretto l'input
      this.openSnackBar('Devi inserire almeno 3 vertici', 'OK');
    } else if (!this.areValidVertices()) { // Sono vertici validi, ossia lo stesso vertice non è ripetuto (e disegnano una figura?)
      this.openSnackBar('Non puoi ripetere lo stesso vertice più di una volta', 'OK');
    } else {
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
      data: {  }
    });

    // Callback per quando si chiude il dialog
    dialogRef.afterClosed().subscribe(result => {
      this.positionService.notifyRemoveAllPosition();
    });
  }

  // Funzione che viene chiamata quando si ha finito con un campo del form
  notify(formIndex: number, discriminator: string, event: any): void {
    const valid = !this.positions[formIndex].hasWrongInput() &&
                  !this.positions[formIndex].hasWrongLatitude() &&
                  !this.positions[formIndex].hasWrongLongitude();
    if (valid) {
      this.positions[formIndex].updateFormView();
    }
    this.positionService.inputFromForm(formIndex, discriminator, +event.target.value, valid);
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
    this.positionService.buyPositionsInArea(this.positionService.polygonPosition);
    this.dialogRef.close();
  }

  getNumberOfPositionsInArea(): number {
    return this.positionService.countPositionsInPolygon(this.positionService.polygonPosition);
  }

}
