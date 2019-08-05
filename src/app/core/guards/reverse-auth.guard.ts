import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanLoad,
  Route,
  UrlSegment
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { take, switchMap, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReverseAuthGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.isAllowed();
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
    return this.isAllowed();
  }

  private isAllowed(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      switchMap(isAuth => {
        if (!isAuth) {
          return this.authService.autoLogin().pipe(
            map(isSuccessful => {
              return !isSuccessful;
            })
          );
        }
        return of(false);
      }),
      tap(result => {
        if (!result) {
          this.router.navigateByUrl('/places/tabs/discover');
        }
      })
    );
  }
}
