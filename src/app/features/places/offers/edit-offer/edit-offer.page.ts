import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Place, PlacesService } from '@app/core';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditOfferPage implements OnInit, OnDestroy {
  offer: Place;
  editOfferForm: FormGroup;
  placeId: string;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(this.placeId).subscribe(
        place => {
          this.updateOffer(place);
          this.isLoading = false;
          this.cd.markForCheck();
        },
        async () => {
          await this.showAllert();
        }
      );
    });
  }

  async onUpdateOffer() {
    if (!this.editOfferForm.valid) {
      return;
    }

    const loadingEl = await this.loadingCtrl.create({
      message: 'Updating place...'
    });
    await loadingEl.present();

    this.placesService
      .updatePlace(
        this.offer.id,
        this.editOfferForm.value.title,
        this.editOfferForm.value.description
      )
      .subscribe(async () => {
        await loadingEl.dismiss();

        this.editOfferForm.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

  private updateOffer(place: Place) {
    this.offer = place;
    this.editOfferForm = new FormGroup({
      title: new FormControl(this.offer.title, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(this.offer.description, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      })
    });
  }

  private async showAllert() {
    const alertEl = await this.alertCtrl.create({
      header: 'An error occurred!',
      message: 'Place could not be fetched. Please try again later.',
      buttons: [
        {
          text: 'OK',
          handler: () => this.router.navigate(['/places/tabs/offers'])
        }
      ]
    });
    await alertEl.present();
  }
}
