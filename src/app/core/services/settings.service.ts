import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _googleMapsAPIKey: string = null;

  constructor(private authService: AuthService, private http: HttpClient) {}

  getGoogleMapsAPIKey(): Observable<string> {
    if (this._googleMapsAPIKey) {
      return of(this._googleMapsAPIKey);
    }

    return this.http
      .get<{ googleMapsAPIKey: string }>(
        'https://ionic-booking-634af.firebaseio.com/settings.json'
      )
      .pipe(
        map(response => response.googleMapsAPIKey),
        tap(googleMapsAPIKey => (this._googleMapsAPIKey = googleMapsAPIKey))
      );
  }
}
