import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseAreaComponent } from './choose-area.component';

describe('ChooseAreaComponent', () => {
  let component: ChooseAreaComponent;
  let fixture: ComponentFixture<ChooseAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
