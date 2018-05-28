import { FormControl, Validators, Form } from '@angular/forms';
import { Position } from '../position';

export class PositionForm {
    positionValue?: Position;
    latitudeFormControl?: FormControl;
    longitudeFormControl?: FormControl;

    constructor(id?: number, latitude?: number, longitude?: number, timestamp?: number) {
        this.positionValue = new Position();
        this.latitudeFormControl = new FormControl('', [Validators.required, Validators.min(0), Validators.max(90)]);
        this.longitudeFormControl = new FormControl('', [Validators.required, Validators.min(0), Validators.max(360)]);
    }

    getErrorMessageLatitude(): String {
        return this.latitudeFormControl.hasError('required') ? 'Devi inserire un valore' :
            this.latitudeFormControl.hasError('max') ? 'Valore massimo latitudine = 90' :
            this.latitudeFormControl.hasError('min') ? 'Valore minimo latitudine = -90' :
            '';
    }

    getErrorMessageLongitude(): String {
        return this.longitudeFormControl.hasError('required') ? 'Devi inserire un valore' :
            this.longitudeFormControl.hasError('max') ? 'Valore massimo longitudine = 360' :
            this.longitudeFormControl.hasError('min') ? 'Valore minimo longitudine = 0' :
            '';
    }

    inputLatitude(latitude: number) {
        this.positionValue.latitude = latitude;
    }

    inputLongitude(longitude: number) {
        this.positionValue.longitude = longitude;
    }
}
