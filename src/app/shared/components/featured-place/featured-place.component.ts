import { Component, OnInit, Input } from '@angular/core';

import { Place, AuthService } from '@app/core';

@Component({
  selector: 'app-featured-place',
  templateUrl: './featured-place.component.html'
})
export class FeaturedPlaceComponent implements OnInit {
  @Input() place: Place;

  constructor(public authService: AuthService) {}

  ngOnInit() {}
}
