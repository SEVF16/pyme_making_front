import { TestBed } from '@angular/core/testing';

import { POSSalesService } from './pos-sales.service';

describe('POSSalesService', () => {
  let service: POSSalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(POSSalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
