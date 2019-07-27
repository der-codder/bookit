import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  SharedModule,
  CreateBookingComponent,
  MapModalComponent
} from '@app/shared';

import { PlaceDetailsPage } from './place-details.page';
import { PlaceDetailsViewComponent } from './place-details-view/place-details-view.component';

const routes: Routes = [
  {
    path: '',
    component: PlaceDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  declarations: [PlaceDetailsPage, PlaceDetailsViewComponent],
  entryComponents: [CreateBookingComponent, MapModalComponent]
})
export class PlaceDetailsPageModule {}
