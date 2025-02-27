import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoStepViewComponent } from './two-step-view.component';

describe('TwoStepViewComponent', () => {
  let component: TwoStepViewComponent;
  let fixture: ComponentFixture<TwoStepViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TwoStepViewComponent]
    });
    fixture = TestBed.createComponent(TwoStepViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
