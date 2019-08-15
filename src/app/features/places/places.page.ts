import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Place, PlacesService } from '@app/core';

interface PlacesViewModel {
  places: Place[];
  featuredPlace: Place;
}

@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss']
})
export class PlacesPage implements OnInit {
  placesViewModel$: Observable<PlacesViewModel>;

  constructor(private placesService: PlacesService) {}

  ngOnInit() {
    this.placesViewModel$ = this.placesService.places$.pipe(
      map(places => this.toPlacesViewModel(places))
    );
  }

  ionViewWillEnter() {
    this.placesService.fetchPlaces().subscribe(() => {});
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
}
