import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Model, ModelFactory } from '@angular-extensions/model';
import { Plugins } from '@capacitor/core';
import { Observable, from, of } from 'rxjs';
import { tap, mapTo, map, take, switchMap } from 'rxjs/operators';

import { environment } from '@env/environment';

import { User } from '../model/user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

interface StoredAuthData {
  userId: string;
  email: string;
  token: string;
  tokenExpirationDate: string;
}

const AUTH_DATA_STORAGE_KEY = 'authData';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private activeLogoutTimer: any;
  private userModel: Model<User>;

  user$: Observable<User>;

  get isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      take(1),
      switchMap(user => {
        const isAuth = this.isUserAuthenticated(user);
        return of(isAuth);
      })
    );
  }

  constructor(
    private http: HttpClient,
    private modelFactory: ModelFactory<User>
  ) {
    this.userModel = this.modelFactory.createMutable(null);
    this.user$ = this.userModel.data$;
  }

  autoLogin(): Observable<boolean> {
    return from(Plugins.Storage.get({ key: AUTH_DATA_STORAGE_KEY })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }

        const authData = JSON.parse(storedData.value) as StoredAuthData;
        const expirationTime = new Date(authData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }

        return new User(
          authData.userId,
          authData.email,
          authData.token,
          expirationTime
        );
      }),
      tap(user => {
        if (user) {
          this.userModel.set(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return this.isUserAuthenticated(user);
      })
    );
  }

  signup(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
          environment.firebaseAPIKey
        }`,
        { email, password, returnSecureToken: true }
      )
      .pipe(
        tap(this.setAuthData.bind(this)),
        mapTo(true)
      );
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
          environment.firebaseAPIKey
        }`,
        { email, password, returnSecureToken: true }
      )
      .pipe(
        tap(userData => this.setAuthData(userData)),
        mapTo(true)
      );
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.userModel.set(null);
    Plugins.Storage.remove({ key: AUTH_DATA_STORAGE_KEY });
  }

  private isUserAuthenticated(user: User): boolean {
    if (!user) {
      return false;
    }
    return !!user.token;
  }

  private setAuthData(authData: AuthResponseData) {
    const expirationDate = new Date(
      new Date().getTime() + +authData.expiresIn * 1000
    );
    const user = new User(
      authData.localId,
      authData.email,
      authData.idToken,
      expirationDate
    );
    this.userModel.set(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData({
      userId: authData.localId,
      email: authData.email,
      token: authData.idToken,
      tokenExpirationDate: expirationDate.toISOString()
    });
  }

  private storeAuthData(authData: StoredAuthData) {
    Plugins.Storage.set({
      key: AUTH_DATA_STORAGE_KEY,
      value: JSON.stringify(authData)
    });
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }
}
