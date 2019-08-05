import { Component, OnInit, Input } from '@angular/core';

import { Place } from '@app/core';

@Component({
  selector: 'app-featured-place',
  templateUrl: './featured-place.component.html'
})
export class FeaturedPlaceComponent implements OnInit {
  @Input() place: Place;

  constructor() {}

  ngOnInit() {}
}
