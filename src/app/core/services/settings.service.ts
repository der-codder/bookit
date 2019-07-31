import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { take, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _googleMapsAPIKey: string = null;

  constructor(private authService: AuthService, private http: HttpClient) {}

  async getGoogleMapsAPIKey(): Promise<string> {
    if (this._googleMapsAPIKey) {
      return this._googleMapsAPIKey;
    }

    this._googleMapsAPIKey = await this.authService.user$
      .pipe(
        take(1),
        switchMap(user => {
          const res = this.http.get<{ googleMapsAPIKey: string }>(
            `https://ionic-booking-634af.firebaseio.com/settings.json?auth=${
              user.token
            }`
          );
          return res;
        }),
        map(response => response.googleMapsAPIKey)
      )
      .toPromise();

    return this._googleMapsAPIKey;
  }
}
