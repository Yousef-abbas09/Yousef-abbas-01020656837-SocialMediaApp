import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { feedguardGuard } from './feedguard-guard';

describe('feedguardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => feedguardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
