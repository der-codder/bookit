import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateBookingComponent } from './components/create-booking/create-booking.component';
import { LocationPickerComponent } from './components/location-picker/location-picker.component';
import { MapModalComponent } from './components/map-modal/map-modal.component';
import { ImagePickerComponent } from './components/image-picker/image-picker.component';
import { FeaturedPlaceComponent } from './components/featured-place/featured-place.component';
import { RouterModule } from '@angular/router';
import { PlacesListComponent } from './components/places-list/places-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonicModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateBookingComponent,
    LocationPickerComponent,
    MapModalComponent,
    ImagePickerComponent,
    FeaturedPlaceComponent,
    PlacesListComponent
  ],
  declarations: [
    CreateBookingComponent,
    LocationPickerComponent,
    MapModalComponent,
    ImagePickerComponent,
    FeaturedPlaceComponent,
    PlacesListComponent
  ]
})
export class SharedModule {}
