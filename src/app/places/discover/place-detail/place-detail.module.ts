import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  SharedModule,
  CreateBookingComponent,
  MapModalComponent
} from '@app/shared';

import { PlaceDetailPage } from './place-detail.page';
import { PlaceDetailsViewComponent } from './place-details-view/place-details-view.component';

const routes: Routes = [
  {
    path: '',
    component: PlaceDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  declarations: [PlaceDetailPage, PlaceDetailsViewComponent],
  entryComponents: [CreateBookingComponent, MapModalComponent]
})
export class PlaceDetailPageModule {}
