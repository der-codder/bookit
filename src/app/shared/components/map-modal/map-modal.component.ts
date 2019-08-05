import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  OnDestroy,
  Input
} from '@angular/core';
import { ModalController } from '@ionic/angular';

import { SettingsService } from '@app/core';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss']
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: true }) mapElementRef: ElementRef;
  @Input() center = { lat: -34.397, lng: 150.644 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  private googleMaps: any;
  private clickListener: any;

  constructor(
    private settingsService: SettingsService,
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) {}

  async ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps()
      .then(googleMaps => {
        this.googleMaps = googleMaps;
        this.renderGoogleMaps(googleMaps);
      })
      .catch(err => {
        console.log(err);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;

    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }

    return new Promise(async (resolve, reject) => {
      const script = document.createElement('script');
      this.settingsService.getGoogleMapsAPIKey().subscribe(googleMapsAPIKey => {
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsAPIKey}`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
          const loadedGoogleModule = win.google;
          if (loadedGoogleModule && loadedGoogleModule.maps) {
            resolve(loadedGoogleModule.maps);
          } else {
            reject('Google maps SDK not available.');
          }
        };
      });
    });
  }

  private renderGoogleMaps(googleMaps: any) {
    const mapEl = this.mapElementRef.nativeElement;
    const map = new googleMaps.Map(mapEl, {
      center: this.center,
      zoom: 16
    });

    googleMaps.event.addListenerOnce(map, 'idle', () => {
      this.renderer.addClass(mapEl, 'visible');
    });

    if (this.selectable) {
      this.clickListener = map.addListener('click', event => {
        const selectedCoords = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        this.modalCtrl.dismiss(selectedCoords);
      });
    } else {
      const marker = new googleMaps.Marker({
        position: this.center,
        map,
        title: 'PickedLocation'
      });
      marker.setMap(map);
    }
  }
}
