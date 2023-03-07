import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddleLayerComponent } from './middle-layer.component';

describe('MiddleLayerComponent', () => {
  let component: MiddleLayerComponent;
  let fixture: ComponentFixture<MiddleLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiddleLayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiddleLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
