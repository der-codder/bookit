import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';

import { Place } from '../model/place.model';
import { AuthService } from '../auth/auth.service';
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

// [
//   new Place(
//     'p1',
//     'Manhattan Mansions',
//     'In the heart of New York City.',
//     'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
//     149.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     "L'Amour Toujours",
//     'A romantic place in Paris.',
//     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
//     189.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'The Foggy Palace',
//     'Not your average city trip!',
//     'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
//     99.89,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   )
// ]

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places(): Observable<Place[]> {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces() {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: PlaceResource }>(
          `https://ionic-booking-634af.firebaseio.com/offered-places.json?auth=${token}`
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
        this._places.next(places);
      })
    );
  }

  getPlace(id: string): Observable<Place> {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<PlaceResource>(
          `https://ionic-booking-634af.firebaseio.com/offered-places/${id}.json?auth=${token}`
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
  ): Observable<Place[]> {
    let generatedId: string;
    let fetchedUserId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User id is empty');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newPlace = new Place(
          null,
          title,
          description,
          imageUrl,
          price,
          availableFrom,
          availableTo,
          fetchedUserId,
          location
        );
        return this.http.post<{ name: string }>(
          `https://ionic-booking-634af.firebaseio.com/offered-places.json?auth=${token}`,
          newPlace
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
          `https://ionic-booking-634af.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ imageUrl: string; imagePath: string }>(
          'https://us-central1-ionic-booking-634af.cloudfunctions.net/storeImage',
          uploadData,
          { headers: { Authorization: 'Bearer ' + token } }
        );
      })
    );
  }

  private mapPlaceResourceToPlace(id: string, placeRes: PlaceResource): Place {
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
