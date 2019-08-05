import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { User } from '../model/user.model';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
  });

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });

  describe('get isAuthenticated$(): Observable<boolean>', () => {
    describe('should return false', () => {
      it('if user is empty', () => {
        const service: AuthService = TestBed.get(AuthService);
        service.user$ = of(null);

        service.isAuthenticated$.subscribe(result =>
          expect(result).toBeFalsy()
        );
      });

      it('if user has expired token', () => {
        const service: AuthService = TestBed.get(AuthService);
        const user: any = { token: null };
        service.user$ = of(user);

        service.isAuthenticated$.subscribe(result =>
          expect(result).toBeFalsy()
        );
      });
    });

    it('should return true if user has not expired token', () => {
      const service: AuthService = TestBed.get(AuthService);
      const user = new User(null, null, null, null);
      const spy = spyOnProperty(user, 'isAuthenticated', 'get').and.returnValue(
        true
      );
      service.user$ = of(user);

      service.isAuthenticated$.subscribe(result => expect(result).toBeTruthy());
      expect(spy).toHaveBeenCalled();
    });
  });
});
