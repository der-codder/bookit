import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PlacesPage } from './places.page';
import { AuthGuard } from '@app/core';

const routes: Routes = [
  {
    path: 'tabs',
    component: PlacesPage,
    children: [
      {
        path: 'discover',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./discover/discover.module').then(
                m => m.DiscoverPageModule
              )
          },
          {
            path: ':placeId',
            loadChildren: () =>
              import('./discover/place-details/place-details.module').then(
                m => m.PlaceDetailsPageModule
              )
          }
        ]
      },
      {
        path: 'offers',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./offers/offers.module').then(m => m.OffersPageModule),
            canLoad: [AuthGuard]
          },
          {
            path: 'new',
            loadChildren: () =>
              import('./offers/new-offer/new-offer.module').then(
                m => m.NewOfferPageModule
              ),
            canLoad: [AuthGuard]
          },
          {
            path: 'edit/:placeId',
            loadChildren: () =>
              import('./offers/edit-offer/edit-offer.module').then(
                m => m.EditOfferPageModule
              ),
            canLoad: [AuthGuard]
          }
        ]
      },
      {
        path: '',
        redirectTo: '/places/tabs/discover',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/places/tabs/discover'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacesRoutingModule {}
