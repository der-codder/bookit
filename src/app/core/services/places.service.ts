import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Model, ModelFactory } from '@angular-extensions/model';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { take, map, tap, switchMap, mapTo } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { Place } from '../model/place.model';
import { PlaceLocation } from '../model/location.model';

interface PlaceResource {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesModel: Model<Place[]>;
  places$: Observable<Place[]>;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private modelFactory: ModelFactory<Place[]>
  ) {
    this.placesModel = this.modelFactory.create(null);
    this.places$ = this.placesModel.data$;
  }

  fetchPlaces(): Observable<boolean> {
    return this.authService.user$.pipe(
      tap(() => {
        // purge places to notify about loading
        this.placesModel.set(null);
      }),
      take(1),
      switchMap(user => {
        return this.http.get<{ [key: string]: PlaceResource }>(
          `https://ionic-booking-634af.firebaseio.com/offered-places.json?auth=${
            user.token
          }`
        );
      }),
      map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(this.mapPlaceResourceToPlace(key, resData[key]));
          }
        }
        return places;
      }),
      tap(places => {
        console.log('-- fetchPlaces.set(places)');
        this.placesModel.set(places);
      }),
      mapTo(true)
    );
  }

  getPlace(id: string): Observable<Place> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        return this.http.get<PlaceResource>(
          `https://ionic-booking-634af.firebaseio.com/offered-places/${id}.json?auth=${
            user.token
          }`
        );
      }),
      map(placeResource => this.mapPlaceResourceToPlace(id, placeResource))
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    availableFrom: Date,
    availableTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User is empty!');
        }
        const newPlace = new Place(
          null,
          title,
          description,
          imageUrl,
          price,
          availableFrom,
          availableTo,
          user.id,
          location
        );
        return this.http
          .post<{ name: string }>(
            `https://ionic-booking-634af.firebaseio.com/offered-places.json?auth=${
              user.token
            }`,
            newPlace
          )
          .pipe(
            map(resData => {
              newPlace.id = resData.name;
              return newPlace;
            })
          );
      }),
      mapTo(true)
    );
  }

  updatePlace(
    placeId: string,
    newTitle: string,
    newDescription: string
  ): Observable<boolean> {
    return combineLatest([
      this.authService.user$,
      this.places$.pipe(
        take(1),
        switchMap(places => {
          if (!places || places.length <= 0) {
            return this.fetchPlaces();
          } else {
            return of(true);
          }
        })
      )
    ]).pipe(
      take(1),
      switchMap(([user, isPlacesFethed]) => {
        const updatedPlace = this.getUpdatedPlace(
          placeId,
          newTitle,
          newDescription
        );
        return this.http.put(
          'https://ionic-booking-634af.firebaseio.com/offered-places/' +
            `${placeId}.json?auth=${user.token}`,
          updatedPlace
        );
      }),
      mapTo(true)
    );
  }

  uploadImage(
    image: File
  ): Observable<{ imageUrl: string; imagePath: string }> {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        return this.http.post<{ imageUrl: string; imagePath: string }>(
          'https://us-central1-ionic-booking-634af.cloudfunctions.net/storeImage',
          uploadData,
          { headers: { Authorization: 'Bearer ' + user.token } }
        );
      })
    );
  }

  private getUpdatedPlace(
    placeId: string,
    newTitle: string,
    newDescription: string
  ): Place {
    const places = this.placesModel.get();
    if (!places) {
      throw new Error('Places is empty!');
    }

    const indexToUpdate = places.findIndex(pl => pl.id === placeId);
    if (indexToUpdate === -1) {
      throw new Error('Can not find a place to update!');
    }

    const outdatedPlace = places[indexToUpdate];
    const updatedPlace = new Place(
      null,
      newTitle,
      newDescription,
      outdatedPlace.imageUrl,
      outdatedPlace.price,
      outdatedPlace.availableFrom,
      outdatedPlace.availableTo,
      outdatedPlace.userId,
      outdatedPlace.location
    );

    return updatedPlace;
  }

  private mapPlaceResourceToPlace(id: string, placeRes: PlaceResource): Place {
    if (!placeRes) {
      throw new Error(`Place with id: '${id}' does not exist.`);
    }
    return new Place(
      id,
      placeRes.title,
      placeRes.description,
      placeRes.imageUrl,
      placeRes.price,
      new Date(placeRes.availableFrom),
      new Date(placeRes.availableTo),
      placeRes.userId,
      placeRes.location
    );
  }
}
