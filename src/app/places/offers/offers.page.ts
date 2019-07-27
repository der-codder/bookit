import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';

import { AuthService, PlacesService, Place } from '@app/core';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersPage implements OnInit {
  offers$: Observable<Place[]>;
  isLoading = false;

  constructor(
    private placesService: PlacesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    let fetchedUserId: string;
    this.offers$ = this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.placesService.places;
      }),
      map(places => {
        return places.filter(place => place.userId === fetchedUserId);
      })
    );
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  async onEdit(offerId: string, slidingItem: IonItemSliding) {
    await slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }
}
