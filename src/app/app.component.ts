import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { Platform } from '@ionic/angular';
import { Capacitor, Plugins, AppState } from '@capacitor/core';

import { AuthService, User } from '@app/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private previousAuthState = false;
  private authSubscription: Subscription;

  constructor(
    public authService: AuthService,
    private platform: Platform,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  ngOnInit() {
    // this.authSubscription = this.authService.isAuthenticated.subscribe(
    //   isAuth => {
    //     if (!isAuth && this.previousAuthState !== isAuth) {
    //       this.router.navigateByUrl('/auth');
    //     }

    //     this.previousAuthState = isAuth;
    //   }
    // );

    console.log('test');
    Plugins.App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
