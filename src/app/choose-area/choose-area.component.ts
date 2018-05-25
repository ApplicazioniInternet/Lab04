import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-choose-area',
  templateUrl: './choose-area.component.html',
  styleUrls: ['./choose-area.component.css']
})
export class ChooseAreaComponent implements OnInit {
  latitude = new FormControl('', [Validators.required, Validators.min(0), Validators.max(90)]);

  constructor() { }

  ngOnInit() {
  }

  getErrorMessage() {
    return this.latitude.hasError('required') ? 'You must enter a value' :
      this.latitude.hasError('latitude') ? 'Not a valid latitude' :
        '';
  }
}
