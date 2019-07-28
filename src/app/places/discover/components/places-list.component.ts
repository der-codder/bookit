import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

import { Place } from '@app/core';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlacesListComponent implements OnInit {
  @Input() places: Place[];

  constructor() {}

  ngOnInit() {}
}
