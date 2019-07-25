import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plugins } from '@capacitor/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from './../../environments/environment.prod';
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
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated(): Observable<boolean> {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId(): Observable<string> {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get token(): Observable<string> {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }

  constructor(private http: HttpClient) {}

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
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  signup(email: string, password: string): Observable<AuthResponseData> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
          environment.firebaseAPIKey
        }`,
        { email, password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
          environment.firebaseAPIKey
        }`,
        { email, password, returnSecureToken: true }
      )
      .pipe(tap(userData => this.setUserData(userData)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({ key: AUTH_DATA_STORAGE_KEY });
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationDate = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationDate
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData({
      userId: userData.localId,
      email: userData.email,
      token: userData.idToken,
      tokenExpirationDate: expirationDate.toISOString()
    });
  }

  private storeAuthData(authData: StoredAuthData) {
    Plugins.Storage.set({
      key: AUTH_DATA_STORAGE_KEY,
      value: JSON.stringify(authData)
    });
  }
}
