import { Component, OnInit, Input } from '@angular/core';
import {
  ModalController,
  ActionSheetController,
  LoadingController
} from '@ionic/angular';

import { Place, PlaceLocation, BookingService } from '@app/core';
import { CreateBookingComponent, MapModalComponent } from '@app/shared';

@Component({
  selector: 'app-place-details-view',
  templateUrl: './place-details-view.component.html'
})
export class PlaceDetailsViewComponent implements OnInit {
  @Input() place: Place;
  @Input() isBookable = false;

  constructor(
    private bookingService: BookingService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  async onBookPlace() {
    if (!this.place) {
      return;
    }

    const actionSheetEl = await this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheetEl.present();
  }

  async onShowMap() {
    if (!this.place) {
      return;
    }

    const modalEl = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        center: {
          lat: this.place.location.lat,
          lng: this.place.location.lng
        },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    });
    await modalEl.present();
  }

  private async openBookingModal(mode: 'select' | 'random') {
    const modalEl = await this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    });
    await modalEl.present();
    const resultData = await modalEl.onDidDismiss();
    if (resultData.role === 'confirm') {
      const loadingEl = await this.loadingCtrl.create({
        message: 'Booking place...'
      });
      await loadingEl.present();
      const bookingData = resultData.data.bookingData;
      this.bookingService
        .addBooking(
          this.place.id,
          this.place.title,
          this.place.imageUrl,
          bookingData.firstName,
          bookingData.lastName,
          bookingData.guestNumber,
          bookingData.startDate,
          bookingData.endDate
        )
        .subscribe(() => loadingEl.dismiss());
    }
  }
}
