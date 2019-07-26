import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateBookingComponent } from './components/create-booking/create-booking.component';
import { LocationPickerComponent } from './components/location-picker/location-picker.component';
import { MapModalComponent } from './components/map-modal/map-modal.component';
import { ImagePickerComponent } from './components/image-picker/image-picker.component';

@NgModule({
  declarations: [
    CreateBookingComponent,
    LocationPickerComponent,
    MapModalComponent,
    ImagePickerComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateBookingComponent,
    LocationPickerComponent,
    MapModalComponent,
    ImagePickerComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class SharedModule {}
