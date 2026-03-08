import { TestBed } from '@angular/core/testing';

import { Commentsservice } from './commentsservice';

describe('Commentsservice', () => {
  let service: Commentsservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Commentsservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
