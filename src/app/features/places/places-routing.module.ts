import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, ReverseAuthGuard } from '@app/core';

import { PlacesPage } from './places.page';
import { TabbedPlacesPage } from './tabbed-places.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabbedPlacesPage,
    children: [
      {
        path: 'discover',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./discover/discover.module').then(
                m => m.DiscoverPageModule
              ),
            canLoad: [AuthGuard]
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
    path: ':placeId',
    loadChildren: () =>
      import('./place-details/place-details.module').then(
        m => m.PlaceDetailsPageModule
      )
  },
  {
    path: '',
    component: PlacesPage,
    canActivate: [ReverseAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacesRoutingModule {}
