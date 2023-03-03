import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameExtractorComponent } from './frame-extractor.component';

describe('FrameExtractorComponent', () => {
  let component: FrameExtractorComponent;
  let fixture: ComponentFixture<FrameExtractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrameExtractorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrameExtractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
