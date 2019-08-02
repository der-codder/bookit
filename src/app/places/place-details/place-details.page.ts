import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, Subject, of } from 'rxjs';
import { take, switchMap, catchError, map } from 'rxjs/operators';

import { Place, AuthService, PlacesService } from '@app/core';

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

      this.place$ = this.authService.user$.pipe(
        take(1),
        switchMap(user => {
          if (!user) {
            throw new Error('User is empty!');
          }
          return this.placesService.getPlace(paramMap.get('placeId')).pipe(
            map(place => {
              return { place, isBookable: place.userId !== user.id };
            })
          );
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
