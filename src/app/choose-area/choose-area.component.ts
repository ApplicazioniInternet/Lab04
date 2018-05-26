import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Position } from '../position';
import { PositionService } from '../position.service';

@Component({
  selector: 'app-choose-area',
  templateUrl: './choose-area.component.html',
  styleUrls: ['./choose-area.component.css']
})
export class ChooseAreaComponent implements OnInit {
  latitudeFormControls: FormControl[];
  longitudeFormControls: FormControl[];
  numberOfVertices = 3;
  index= 0;

  constructor(private positionService: PositionService) {
    this.latitudeFormControls = new Array(this.numberOfVertices)
                            .fill(new FormControl());
    this.longitudeFormControls = new Array(this.numberOfVertices)
      .fill(new FormControl('', [Validators.required, Validators.min(0), Validators.max(360)]));
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
    this.longitudeFormControls.push(new FormControl('', [Validators.required, Validators.min(0), Validators.max(360)]));
    this.latitudeFormControls.push(new FormControl('', [Validators.required, Validators.min(-90), Validators.max(90)]));
  }

  updateIndex(i: number) {
    this.index = i;
  }
}
