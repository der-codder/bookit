import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AuthService, AuthResponseData } from '@app/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  async onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;

    await this.authenticate(email, password);
    form.reset();
  }

  private async authenticate(email: string, password: string) {
    this.isLoading = true;
    const loadingEl = await this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in ...'
    });
    await loadingEl.present();

    let auth$: Observable<boolean>;
    if (this.isLogin) {
      auth$ = this.authService.login(email, password);
    } else {
      auth$ = this.authService.signup(email, password);
    }
    auth$.subscribe(
      async () => {
        this.isLoading = false;
        await loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      },
      async errorRes => {
        await loadingEl.dismiss();
        await this.showAlert(errorRes.error.error.message);
      }
    );
  }

  private async showAlert(code: string) {
    let message = 'Could not sign you up, please try again.';
    if (code === 'EMAIL_EXISTS') {
      message = 'The email address is already in use by another account.';
    } else if (code === 'EMAIL_NOT_FOUND') {
      message = 'E-Mail address could not be found.';
    } else if (code === 'INVALID_PASSWORD') {
      message = 'This password is not correct.';
    }

    const alertEl = await this.alertCtrl.create({
      header: 'Authentication failed',
      message,
      buttons: ['OK']
    });
    await alertEl.present();
  }
}
