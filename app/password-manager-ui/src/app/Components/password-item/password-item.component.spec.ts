import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordItemComponent } from './password-item.component';

describe('PasswordItemComponent', () => {
  let component: PasswordItemComponent;
  let fixture: ComponentFixture<PasswordItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordItemComponent]
    });
    fixture = TestBed.createComponent(PasswordItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
