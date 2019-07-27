import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, Subject, of } from 'rxjs';
import { take, switchMap, catchError, map } from 'rxjs/operators';

import { Place, AuthService, PlacesService } from '@app/core';

interface PlaceDetailsData {
  place: Place;
  userId: string;
}

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.page.html',
  styleUrls: ['./place-details.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceDetailsPage implements OnInit {
  place$: Observable<PlaceDetailsData>;
  loadingError$ = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private placesService: PlacesService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      let fetchedUserId: string;
      this.place$ = this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
          if (!userId) {
            throw new Error('User id is empty');
          }
          fetchedUserId = userId;
          return this.placesService.getPlace(paramMap.get('placeId'));
        }),
        map<Place, PlaceDetailsData>(place => {
          return { place, userId: fetchedUserId };
        }),
        catchError(error => {
          console.error('Error loading place details.', error);
          this.loadingError$.next(true);
          return of(null);
        })
      );
    });
  }
}
