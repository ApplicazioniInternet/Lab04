import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionsBoughtComponent } from './positions-bought.component';

describe('PositionsBoughtComponent', () => {
  let component: PositionsBoughtComponent;
  let fixture: ComponentFixture<PositionsBoughtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionsBoughtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionsBoughtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
