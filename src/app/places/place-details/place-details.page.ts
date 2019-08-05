import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Place, AuthService, PlacesService, SettingsService } from '@app/core';

interface PlaceViewModel {
  place: Place;
  isBookable: boolean;
}

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.page.html',
  styleUrls: ['./place-details.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceDetailsPage implements OnInit {
  place$: Observable<PlaceViewModel>;
  loadingError$ = new Subject<boolean>();

  constructor(
    public authService: AuthService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.place$ = combineLatest([
        this.placesService.getPlace(paramMap.get('placeId')),
        this.settingsService.getGoogleMapsAPIKey(),
        this.authService.user$
      ]).pipe(
        map(([place, googleMapsAPIKey, user]) => {
          const isBookable = user ? place.userId !== user.id : false;

          // TODO: the backend should do this
          place.location.staticMapImageUrl =
            place.location.staticMapImageUrl + `&key=${googleMapsAPIKey}`;
          return { place, isBookable };
        })
      );
    });
  }
}
