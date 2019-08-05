import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { ReverseAuthGuard } from './reverse-auth.guard';
import { AuthService } from '../services/auth.service';

class MockAuthService {
  isAuthenticated$: Observable<boolean>;

  autoLogin(): Observable<boolean> {
    return null;
  }
}

class MockRouter {
  navigateByUrl(url: string) {
    return;
  }
}

describe('ReverseAuthGuard', () => {
  let reverseAuthGuard: ReverseAuthGuard;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReverseAuthGuard,
        {
          provide: AuthService,
          useValue: new MockAuthService()
        },
        {
          provide: Router,
          useValue: new MockRouter()
        }
      ]
    });

    reverseAuthGuard = TestBed.get(ReverseAuthGuard);
    authService = TestBed.get(AuthService);
    router = TestBed.get(Router);
  });

  afterEach(() => {
    authService = null;
    router = null;
  });

  describe('canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>', () => {
    describe('should return true', () => {
      it('if user is not authenticated and autoLogin is not successful', () => {
        authService.isAuthenticated$ = of(false);
        spyOn(authService, 'autoLogin').and.returnValue(of(false));

        reverseAuthGuard.canActivate(null, null).subscribe(result => {
          expect(result).toBeTruthy();
        });
        expect(authService.autoLogin).toHaveBeenCalled();
      });
    });

    describe('if user is authenticated', () => {
      it('should return false', () => {
        authService.isAuthenticated$ = of(true);

        reverseAuthGuard.canActivate(null, null).subscribe(result => {
          expect(result).toBeFalsy();
        });
      });

      it('should navigate to "/places/tabs/discover"', () => {
        authService.isAuthenticated$ = of(true);
        spyOn(router, 'navigateByUrl').and.returnValue(of(false));

        reverseAuthGuard.canActivate(null, null).subscribe(result => {
          expect(result).toBeFalsy();
        });
        expect(router.navigateByUrl).toHaveBeenCalledWith(
          '/places/tabs/discover'
        );
      });
    });
  });

  describe('canLoad(route: Route, segments: UrlSegment[]): Observable<boolean>', () => {
    describe('should return true', () => {
      it('if user is not authenticated and autoLogin is not successful', () => {
        authService.isAuthenticated$ = of(false);
        spyOn(authService, 'autoLogin').and.returnValue(of(false));

        reverseAuthGuard.canLoad(null, null).subscribe(result => {
          expect(result).toBeTruthy();
        });
        expect(authService.autoLogin).toHaveBeenCalled();
      });
    });

    describe('if user is authenticated', () => {
      it('should return false', () => {
        authService.isAuthenticated$ = of(true);

        reverseAuthGuard.canLoad(null, null).subscribe(result => {
          expect(result).toBeFalsy();
        });
      });

      it('should navigate to "/places/tabs/discover"', () => {
        authService.isAuthenticated$ = of(true);
        spyOn(router, 'navigateByUrl').and.returnValue(of(false));

        reverseAuthGuard.canLoad(null, null).subscribe(result => {
          expect(result).toBeFalsy();
        });
        expect(router.navigateByUrl).toHaveBeenCalledWith(
          '/places/tabs/discover'
        );
      });
    });
  });
});
