import { switchMap } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PlacesService, PlaceLocation } from '@app/core';

function base64toBlob(base64Data: any, contentType: any) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss']
})
export class NewOfferPage implements OnInit {
  newOfferForm: FormGroup;

  constructor(
    private placeService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.newOfferForm = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(0)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null)
    });
  }

  onCreateOffer() {
    if (!this.newOfferForm.valid || !this.newOfferForm.get('image').value) {
      return;
    }
    console.log(this.newOfferForm.value);
    this.loadingCtrl
      .create({
        message: 'Adding a new place...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.placeService
          .uploadImage(this.newOfferForm.get('image').value)
          .pipe(
            switchMap(uploadResponse => {
              return this.placeService.addPlace(
                this.newOfferForm.value.title,
                this.newOfferForm.value.description,
                +this.newOfferForm.value.price,
                new Date(this.newOfferForm.value.dateFrom),
                new Date(this.newOfferForm.value.dateTo),
                this.newOfferForm.value.location,
                uploadResponse.imageUrl
              );
            })
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.newOfferForm.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }

  onLocationPicked(placeLocation: PlaceLocation) {
    this.newOfferForm.patchValue({ location: placeLocation });
  }

  onImagePicked(imageData: string | File) {
    let imageFile: Blob;
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg'
        );
      } catch (error) {
        console.error(error);
        return;
      }
    } else {
      imageFile = imageData;
    }

    this.newOfferForm.patchValue({ image: imageFile });
  }
}
