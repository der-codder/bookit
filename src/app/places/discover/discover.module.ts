import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '@app/shared';

import { DiscoverPage } from './discover.page';
import { PlacesListComponent } from './places-list/places-list.component';

const routes: Routes = [
  {
    path: '',
    component: DiscoverPage
  }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [DiscoverPage, PlacesListComponent]
})
export class DiscoverPageModule {}
