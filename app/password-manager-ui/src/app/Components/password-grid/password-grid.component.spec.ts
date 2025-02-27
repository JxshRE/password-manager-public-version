import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordGridComponent } from './password-grid.component';

describe('PasswordGridComponent', () => {
  let component: PasswordGridComponent;
  let fixture: ComponentFixture<PasswordGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordGridComponent]
    });
    fixture = TestBed.createComponent(PasswordGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
