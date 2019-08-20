import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

import { Place } from '@app/core';

@Component({
  selector: 'app-featured-place',
  templateUrl: './featured-place.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedPlaceComponent implements OnInit {
  @Input() place: Place;

  constructor() {}

  ngOnInit() {}
}
