import { TestBed } from '@angular/core/testing';

import { AuthprotectionService } from './authprotection.service';

describe('AuthprotectionService', () => {
  let service: AuthprotectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthprotectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
