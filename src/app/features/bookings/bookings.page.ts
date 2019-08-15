import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';

import { BookingService, Booking } from '@app/core';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsPage implements OnInit {
  constructor(
    public bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.bookingService.fetchBookings().subscribe(() => {});
  }

  async onCancelBooking(bookingId: string, slidingItem: IonItemSliding) {
    await slidingItem.close();
    const loadingEl = await this.loadingCtrl.create({
      message: 'Cancelling...'
    });
    await loadingEl.present();

    this.bookingService.cancelBooking(bookingId).subscribe(async () => {
      await loadingEl.dismiss();
    });
  }
}
