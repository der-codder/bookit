import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '@app/shared';

import { DiscoverPage } from './discover.page';
import { PlacesListComponent } from './components/places-list.component';
import { FeaturedPlaceComponent } from './components/featured-place.component';

const routes: Routes = [
  {
    path: '',
    component: DiscoverPage
  }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [DiscoverPage, PlacesListComponent, FeaturedPlaceComponent]
})
export class DiscoverPageModule {}
