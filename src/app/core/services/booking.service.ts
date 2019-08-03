import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Model, ModelFactory } from '@angular-extensions/model';
import { Observable, of } from 'rxjs';
import { take, tap, map, switchMap, mapTo } from 'rxjs/operators';

import { Booking } from '../model/booking.model';
import { AuthService } from './auth.service';

interface BookingResource {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

interface BookingsResponse {
  [key: string]: BookingResource;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsModel: Model<Booking[]>;
  bookings$: Observable<Booking[]>;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private modelFactory: ModelFactory<Booking[]>
  ) {
    this.bookingsModel = this.modelFactory.create(null);
    this.bookings$ = this.bookingsModel.data$;
  }

  fetchBookings(): Observable<boolean> {
    return this.authService.user$.pipe(
      tap(() => {
        // purge bookings to notify about loading
        this.bookingsModel.set(null);
      }),
      take(1),
      switchMap(user => {
        if (!user) {
          // TODO: Need to return BookingsResponse
          return of(null);
        }
        return this.http.get<BookingsResponse>(
          'https://ionic-booking-634af.firebaseio.com/bookings.json' +
            `?orderBy="userId"&equalTo="${user.id}"&auth=${user.token}`
        );
      }),
      tap(response => {
        this.bookingsModel.set(this.convertToBookings(response));
      }),
      mapTo(true)
    );
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User is empty!');
        }
        const newBooking = new Booking(
          null,
          placeId,
          user.id,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );
        return this.http
          .post<{ name: string }>(
            `https://ionic-booking-634af.firebaseio.com/bookings.json?auth=${
              user.token
            }`,
            newBooking
          )
          .pipe(
            map(resData => {
              newBooking.id = resData.name;
              return newBooking;
            })
          );
      }),
      mapTo(true)
    );
  }

  cancelBooking(bookingId: string): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User is empty!');
        }
        return this.http.delete(
          'https://ionic-booking-634af.firebaseio.com/bookings/' +
            `${bookingId}.json?auth=${user.token}`
        );
      }),
      tap(() => {
        const bookings = this.bookingsModel.get();
        bookings.splice(bookings.findIndex(b => b.id === bookingId), 1);

        this.bookingsModel.set(bookings);
      }),
      mapTo(true)
    );
  }

  private convertToBookings(bookingsResponse: BookingsResponse): Booking[] {
    const bookings = [];
    if (!bookingsResponse) {
      return bookings;
    }

    for (const key in bookingsResponse) {
      if (bookingsResponse.hasOwnProperty(key)) {
        bookings.push(
          this.mapBookingResourceToBooking(key, bookingsResponse[key])
        );
      }
    }
    return bookings;
  }

  private mapBookingResourceToBooking(
    id: string,
    bookingResource: BookingResource
  ): Booking {
    return new Booking(
      id,
      bookingResource.placeId,
      bookingResource.userId,
      bookingResource.placeTitle,
      bookingResource.placeImage,
      bookingResource.firstName,
      bookingResource.lastName,
      bookingResource.guestNumber,
      new Date(bookingResource.bookedFrom),
      new Date(bookingResource.bookedTo)
    );
  }
}
