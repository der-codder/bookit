import { Component, OnInit, OnDestroy } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

import { PlacesService, Place, AuthService } from '@app/core';

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
    let fetchedUserId: string;
    this.placesSub = this.authService.userId
      .pipe(
        take(1),
        switchMap(userId => {
          if (!userId) {
            throw new Error('User id is empty');
          }
          fetchedUserId = userId;
          return this.placesService.places;
        })
      )
      .subscribe(places => {
        this.loadedPlaces = places;
        if (this.chosenFilter === 'all') {
          this.relevantPlaces = this.loadedPlaces;
          this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        } else {
          this.relevantPlaces = this.loadedPlaces.filter(
            place => place.userId !== fetchedUserId
          );
          this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        }
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
