import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService, PlacesService, Place } from '@app/core';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersPage implements OnInit {
  offers$: Observable<Place[]>;

  constructor(
    private placesService: PlacesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.offers$ = combineLatest([
      this.placesService.places$,
      this.authService.user$
    ]).pipe(
      map(([places, user]) => {
        if (!places || !user) {
          return null;
        }
        return places.filter(place => place.userId === user.id);
      })
    );
  }

  ionViewWillEnter() {
    this.placesService.fetchPlaces().subscribe(() => {});
  }

  async onEdit(offerId: string, slidingItem: IonItemSliding) {
    await slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }
}
