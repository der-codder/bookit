import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap, delay, map, switchMap } from 'rxjs/operators';

import { Booking } from '../model/booking.model';
import { AuthService } from '../auth/auth.service';

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

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings(): Observable<Booking[]> {
    return this._bookings.asObservable();
  }

  fetchBookings(): Observable<any[]> {
    let fetchedUserId: string;
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
        return this.http.get<{ [key: string]: BookingResource }>(
          'https://ionic-booking-634af.firebaseio.com/bookings.json' +
            `?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        );
      }),
      map(bookingData => {
        const bookings = [];
        for (const key in bookingData) {
          if (bookingData.hasOwnProperty(key)) {
            bookings.push(
              this.mapBookingResourceToBooking(key, bookingData[key])
            );
          }
        }
        return bookings;
      }),
      tap(bookings => {
        this._bookings.next(bookings);
      })
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
  ): Observable<Booking[]> {
    let generatedId: string;
    let newBooking: Booking;
    let fetchedUserId: string;
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
        newBooking = new Booking(
          null,
          placeId,
          fetchedUserId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );
        return this.http.post<{ name: string }>(
          'https://ionic-booking-634af.firebaseio.com/bookings.json?auth=' +
            token,
          newBooking
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string): Observable<Booking[]> {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http
          .delete(
            `https://ionic-booking-634af.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
          )
          .pipe(
            switchMap(() => this.bookings),
            take(1),
            tap(bookings => {
              this._bookings.next(bookings.filter(b => b.id !== bookingId));
            })
          );
      })
    );
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
