import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoughtPositionsComponent } from './bought-positions.component';

describe('BoughtPositionsComponent', () => {
  let component: BoughtPositionsComponent;
  let fixture: ComponentFixture<BoughtPositionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoughtPositionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoughtPositionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
