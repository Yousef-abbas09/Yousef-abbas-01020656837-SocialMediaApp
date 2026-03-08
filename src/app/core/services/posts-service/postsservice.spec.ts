import { TestBed } from '@angular/core/testing';

import { Postsservice } from './postsservice';

describe('Postsservice', () => {
  let service: Postsservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Postsservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
