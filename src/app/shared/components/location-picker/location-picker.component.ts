import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor, Plugins } from '@capacitor/core';
import {
  ModalController,
  ActionSheetController,
  AlertController
} from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { PlaceLocation, SettingsService } from '@app/core';

import { MapModalComponent } from '../map-modal/map-modal.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  private _googleMapsAPIKey: string;

  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;

  selectedLocationImageUrl: string;
  isLoadingLocationImage = false;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this._googleMapsAPIKey = await this.settingsService.getGoogleMapsAPIKey();
  }

  onPickLocation() {
    this.actionSheetCtrl
      .create({
        header: 'Chose Location',
        buttons: [
          {
            text: 'Auto-Locate',
            handler: () => {
              this.locateUser();
            }
          },
          {
            text: 'Pick on Map',
            handler: () => {
              this.openMap();
            }
          },
          { text: 'Cancel', role: 'cancel' }
        ]
      })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }

  private locateUser() {
    if (Capacitor.isPluginAvailable('Geolocation')) {
      this.showLocationFetchingErrorAlert();
      return;
    }

    this.isLoadingLocationImage = true;
    Plugins.Geolocation.getCurrentPosition()
      .then(geoPosition => {
        this.updateLocation(
          geoPosition.coords.latitude,
          geoPosition.coords.longitude
        );
        this.isLoadingLocationImage = false;
      })
      .catch(() => {
        this.isLoadingLocationImage = false;
        this.showLocationFetchingErrorAlert();
      });
  }

  private showLocationFetchingErrorAlert() {
    this.alertCtrl
      .create({
        header: 'Could not fetch location',
        message: 'Please use the map to pick a location!',
        buttons: ['OK']
      })
      .then(alertEl => alertEl.present());
  }

  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        this.updateLocation(modalData.data.lat, modalData.data.lng);
      });
      modalEl.present();
    });
  }

  private updateLocation(latitude: number, longitude: number) {
    const pickedLocation: PlaceLocation = {
      lat: latitude,
      lng: longitude,
      address: null,
      staticMapImageUrl: null
    };
    this.isLoadingLocationImage = true;

    this.getAddress(pickedLocation.lat, pickedLocation.lng)
      .pipe(
        switchMap(address => {
          pickedLocation.address = address;
          return of(
            this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
          );
        })
      )
      .subscribe(staticMapImageUrl => {
        pickedLocation.staticMapImageUrl = staticMapImageUrl;
        this.selectedLocationImageUrl = staticMapImageUrl;
        this.isLoadingLocationImage = false;
        this.locationPick.emit(pickedLocation);
      });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<{ results: any[] }>(
        'https://maps.googleapis.com/maps/api/geocode/json?' +
          `latlng=${lat},${lng}&key=${this._googleMapsAPIKey}`
      )
      .pipe(
        map(geoData => {
          if (!geoData || !geoData.results || geoData.results.length <= 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return (
      'https://maps.googleapis.com/maps/api/staticmap?' +
      `center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap` +
      `&markers=color:red%7Place:S%7C${lat},${lng}` +
      `&key=${this._googleMapsAPIKey}`
    );
  }
}
