import { TestBed } from '@angular/core/testing';

import { POSSessionsService } from './pos-sessions.service';

describe('POSSessionsService', () => {
  let service: POSSessionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(POSSessionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
