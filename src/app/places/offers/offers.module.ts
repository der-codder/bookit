import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '@app/shared';

import { OffersPage } from './offers.page';
import { OfferItemComponent } from './offer-item/offer-item.component';

const routes: Routes = [
  {
    path: '',
    component: OffersPage
  }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [OffersPage, OfferItemComponent]
})
export class OffersPageModule {}
