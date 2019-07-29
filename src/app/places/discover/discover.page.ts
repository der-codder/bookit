import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { PlacesService, Place, AuthService } from '@app/core';

interface PlacesViewModel {
  places: Place[];
  featuredPlace: Place;
}

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverPage implements OnInit {
  placesViewModel$: Observable<PlacesViewModel>;
  filter$ = new BehaviorSubject<string>('all');

  constructor(
    private placesService: PlacesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.placesViewModel$ = combineLatest([
      this.placesService.places$,
      this.authService.user$,
      this.filter$
    ]).pipe(
      map(([places, user, filter]) => {
        if (!user || !user.id || user.id.length === 0) {
          return { places: [], featuredPlace: null };
        }
        if (filter === 'all') {
          return this.toPlacesViewModel(places);
        } else if (filter === 'bookable') {
          const relevantPlaces = places
            ? places.filter(place => place.userId !== user.id)
            : null;
          return this.toPlacesViewModel(relevantPlaces);
        } else {
          throw new Error(`Filter value is inappropriate: ${filter}`);
        }
      })
    );
  }

  private toPlacesViewModel(places: Place[]): PlacesViewModel {
    if (!places) {
      return null;
    } else if (places.length <= 0) {
      return { places, featuredPlace: null };
    } else {
      const featuredPlace = places[0];
      return { places: places.slice(1), featuredPlace };
    }
  }

  ionViewWillEnter() {
    this.placesService.fetchPlaces().subscribe(() => {});
  }

  onFilterUpdate(newFilterValue: 'all' | 'bookable') {
    this.filter$.next(newFilterValue);
  }
}
