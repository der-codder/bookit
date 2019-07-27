import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

import { PlacesService, Place, AuthService } from '@app/core';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  relevantPlaces: Place[];
  featuredPlace: Place;
  isLoading = false;
  chosenFilter: 'all' | 'bookable' = 'all';
  private placesSub: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private placesService: PlacesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
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
        this.updateRelevantPlaces(fetchedUserId);
        this.isLoading = false;
        this.cd.markForCheck();
      });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
      this.cd.markForCheck();
    });
  }

  onFilterUpdate(newFilterValue: 'all' | 'bookable') {
    this.chosenFilter = newFilterValue;
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      this.updateRelevantPlaces(userId);
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

  private updateRelevantPlaces(userId: string) {
    if (this.chosenFilter === 'all') {
      this.featuredPlace = this.loadedPlaces[0];
      this.relevantPlaces = this.loadedPlaces.slice(1);
    } else {
      const allRelevantPlaces = this.loadedPlaces.filter(
        place => place.userId !== userId
      );
      this.featuredPlace = allRelevantPlaces[0];
      this.relevantPlaces = allRelevantPlaces.slice(1);
    }
  }
}
