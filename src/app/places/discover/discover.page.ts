import { Component, OnInit, OnDestroy } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';

import { PlacesService } from '../places.service';
import { Place } from '../../model/place.model';
import { AuthService } from '../../auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss']
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
  private chosenFilter: 'all' | 'bookable' = 'all';
  private placesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => (this.isLoading = false));
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        this.chosenFilter = 'all';
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          place => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        this.chosenFilter = 'bookable';
      }
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
