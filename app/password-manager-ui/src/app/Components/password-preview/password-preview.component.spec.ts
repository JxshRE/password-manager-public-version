import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordPreviewComponent } from './password-preview.component';

describe('PasswordPreviewComponent', () => {
  let component: PasswordPreviewComponent;
  let fixture: ComponentFixture<PasswordPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordPreviewComponent]
    });
    fixture = TestBed.createComponent(PasswordPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
