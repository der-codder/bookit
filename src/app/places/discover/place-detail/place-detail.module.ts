import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule, CreateBookingComponent } from '@app/shared';

import { PlaceDetailPage } from './place-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PlaceDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  declarations: [PlaceDetailPage],
  entryComponents: [CreateBookingComponent]
})
export class PlaceDetailPageModule {}
