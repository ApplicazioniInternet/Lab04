import { FormControl, Validators, Form, FormGroup,  } from '@angular/forms';
import { Position } from '../position';
import { ElementRef } from '@angular/core';

export class PositionForm {
    id: number;
    positionValue?: Position;
    group: FormGroup;
    inputLatitudeField: any;
    inputLongitudeField: any;

    constructor(id: number, latitude?: number, longitude?: number, timestamp?: number) {
        this.id = id;
        this.positionValue = new Position(id, undefined, undefined, undefined);

        // Creo i validati dell'input del form
        const latitudeFormControl = new FormControl('', [Validators.required,
                                                        Validators.min(0),
                                                        Validators.max(90),
                                                        Validators.pattern('[0-9]+[.]?[0-9]*')]);
        const longitudeFormControl = new FormControl('', [Validators.required,
                                                        Validators.min(0),
                                                        Validators.max(360),
                                                        Validators.pattern('[0-9]+[.]?[0-9]*')]);

        // Metto tutti i validatori in un unico gruppo
        this.group = new FormGroup({
            'latitude': latitudeFormControl,
            'longitude': longitudeFormControl
        }, this.validateGroup);
    }

    // Funzione per validare il gruppo, ora non fa nulla, ma nel dubbio io ce l'ho cacciata
    validateGroup(g: FormGroup) {
        return (g.get('latitude').valid && g.get('longitude').valid) ? null : { 'mismatch': true };
    }

    // Funzione per fare l'update dell'input arrivato dalla mappa
    updateView(latitude: number, longitude: number): void {
        this.inputLatitude(latitude);
        this.inputLongitude(longitude);
        this.group.get('latitude').setValue(latitude);
        this.group.get('longitude').setValue(longitude);
    }

    // Funzione per prendere il messaggio di errore sulla latitudine
    getErrorMessageLatitude(): String {
        return this.group.get('latitude').hasError('required') ? 'Devi inserire un valore' :
            this.group.get('latitude').hasError('max') ? 'Valore massimo latitudine = 90' :
            this.group.get('latitude').hasError('min') ? 'Valore minimo latitudine = -90' :
            this.group.get('latitude').hasError('pattern') ? 'Consentiti solo valori numerici' :
            '';
    }

    // Funzione per prendere il messaggio di errore sulla longitudine
    getErrorMessageLongitude(): String {
        return this.group.get('longitude').hasError('required') ? 'Devi inserire un valore' :
            this.group.get('longitude').hasError('max') ? 'Valore massimo longitudine = 360' :
            this.group.get('longitude').hasError('min') ? 'Valore minimo longitudine = 0' :
            this.group.get('longitude').hasError('pattern') ? 'Consentiti solo valori numerici' :
            '';
    }

    // Funzione per aggiornare la latitudine
    inputLatitude(latitude: number) {
        this.positionValue.latitude = latitude;
    }

    // Funzione per aggiornare la longitudine
    inputLongitude(longitude: number) {
        this.positionValue.longitude = longitude;
    }

    // Funzione per controllare se le coordinate inserite in questo form corrispondono a quelle della posizione passata come parametro
    sameCoordinates(position: Position) {
        return this.positionValue.latitude === position.latitude && this.positionValue.longitude === position.longitude;
    }

    // Funzione per controllare se c'è un errore nell'input
    hasWrongInput(): boolean {
        return this.group.get('latitude').hasError('required') ||
            this.group.get('latitude').hasError('max') ||
            this.group.get('latitude').hasError('min') ||
            this.group.get('latitude').hasError('pattern') ||
            this.group.get('longitude').hasError('required') ||
            this.group.get('longitude').hasError('max') ||
            this.group.get('longitude').hasError('min') ||
            this.group.get('longitude').hasError('pattern');
    }

    // Funzione per capire se il form è vuoto
    isEmpty(): boolean {
        return this.positionValue.latitude === undefined && this.positionValue.longitude === undefined;
    }
}
