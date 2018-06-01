import { FormControl, Validators, Form,  } from '@angular/forms';
import { Position } from '../position';
import { ElementRef } from '@angular/core';

export class PositionForm {

    id: number;
    positionValue?: Position;
    latitudeFormControl?: FormControl;
    longitudeFormControl?: FormControl;
    inputLatitudeField: any;
    inputLongitudeField: any;


    constructor(id: number, latitude?: number, longitude?: number, timestamp?: number) {
        this.id = id;
        this.positionValue = new Position(id, undefined, undefined, undefined);
        this.latitudeFormControl = new FormControl('', [Validators.required,
                                                        Validators.min(0),
                                                        Validators.max(90),
                                                        Validators.pattern('[0-9]+[.]?[0-9]*')]);
        this.longitudeFormControl = new FormControl('', [Validators.required,
                                                        Validators.min(0),
                                                        Validators.max(360),
                                                        Validators.pattern('[0-9]+[.]?[0-9]*')]);
    }

    updateView(): void {
        this.latitudeFormControl.setValue(this.positionValue.latitude);
        this.longitudeFormControl.setValue(this.positionValue.longitude);
    }
    getErrorMessageLatitude(): String {
        return this.latitudeFormControl.hasError('required') ? 'Devi inserire un valore' :
            this.latitudeFormControl.hasError('max') ? 'Valore massimo latitudine = 90' :
            this.latitudeFormControl.hasError('min') ? 'Valore minimo latitudine = -90' :
            this.latitudeFormControl.hasError('pattern') ? 'Consentiti solo valori numerici' :
            '';
    }

    getErrorMessageLongitude(): String {
        return this.longitudeFormControl.hasError('required') ? 'Devi inserire un valore' :
            this.longitudeFormControl.hasError('max') ? 'Valore massimo longitudine = 360' :
            this.longitudeFormControl.hasError('min') ? 'Valore minimo longitudine = 0' :
            this.longitudeFormControl.hasError('pattern') ? 'Consentiti solo valori numerici' :
            '';
    }

    inputLatitude(latitude: number) {
        this.positionValue.latitude = latitude;
    }

    inputLongitude(longitude: number) {
        this.positionValue.longitude = longitude;
    }

    sameCoordinates(position: Position) {
        return this.positionValue.latitude === position.latitude && this.positionValue.longitude === position.longitude;
    }

    hasWrongInput(): boolean {
        return this.latitudeFormControl.hasError('required') ||
                this.latitudeFormControl.hasError('max') ||
                this.latitudeFormControl.hasError('min') ||
                this.latitudeFormControl.hasError('pattern') ||
                this.longitudeFormControl.hasError('required') ||
                this.longitudeFormControl.hasError('max') ||
                this.longitudeFormControl.hasError('min') ||
                this.longitudeFormControl.hasError('pattern');
    }

    isEmpty(): boolean {
        return this.positionValue.latitude === undefined && this.positionValue.longitude === undefined;
    }
}
