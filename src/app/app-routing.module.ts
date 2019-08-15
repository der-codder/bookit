import { ReverseAuthGuard } from './core/guards/reverse-auth.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@app/core';

const routes: Routes = [
  { path: '', redirectTo: 'places', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthPageModule),
    canLoad: [ReverseAuthGuard]
  },
  {
    path: 'places',
    loadChildren: () =>
      import('./features/places/places.module').then(m => m.PlacesPageModule)
  },
  {
    path: 'bookings',
    loadChildren: () =>
      import('./features/bookings/bookings.module').then(
        m => m.BookingsPageModule
      ),
    canLoad: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
