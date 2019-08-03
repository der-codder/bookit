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
    public authService: AuthService,
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

      this.place$ = this.authService.user$.pipe(
        take(1),
        switchMap(user => {
          return this.placesService.getPlace(paramMap.get('placeId')).pipe(
            map(place => {
              const isBookable = user ? place.userId !== user.id : false;
              return { place, isBookable };
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
