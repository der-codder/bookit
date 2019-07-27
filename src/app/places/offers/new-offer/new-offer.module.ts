import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule, MapModalComponent } from '@app/shared';

import { NewOfferPage } from './new-offer.page';

const routes: Routes = [
  {
    path: '',
    component: NewOfferPage
  }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [NewOfferPage],
  entryComponents: [MapModalComponent]
})
export class NewOfferPageModule {}
