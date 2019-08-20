import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tabbed-places',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="discover">
          <ion-label>Discover</ion-label>
          <ion-icon name="search"></ion-icon>
        </ion-tab-button>
        <ion-tab-button tab="offers">
          <ion-label>My Offers</ion-label>
          <ion-icon name="card"></ion-icon>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabbedPlacesPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
