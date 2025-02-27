import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordGeneratorViewComponent } from './password-generator-view.component';

describe('PasswordGeneratorViewComponent', () => {
  let component: PasswordGeneratorViewComponent;
  let fixture: ComponentFixture<PasswordGeneratorViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordGeneratorViewComponent]
    });
    fixture = TestBed.createComponent(PasswordGeneratorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
