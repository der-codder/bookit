![technology scope](https://raw.githubusercontent.com/yuriity/bookit/master/meta-assets/technologies-scope.png)

# BookIt - sample Ionic/Angular app using RxJs, Google Maps and Firebase

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**DEMO: https://yuriity.github.io/bookit/places**

![application screens](https://raw.githubusercontent.com/yuriity/bookit/master/meta-assets/app-screens.jpg)

## Application Improvements

This application started as a practice project of _**Maximilian Schwarzmüller**_'s Udemy course _[Ionic 4 - Build iOS, Android & Web Apps with Ionic & Angular](https://www.udemy.com/ionic-2-the-practical-guide-to-building-ios-android-apps/)_. But from that time this project has a lot of improvements.

### Architecture enhancement

The default project structure looks like a mess of random folders, and this could be changed to something more precise. Thanks to [Tomas Trajan](https://medium.com/@tomastrajan) and his [article](https://medium.com/@tomastrajan/6-best-practices-pro-tips-for-angular-cli-better-developer-experience-7b328bc9db81) we have a good guideline to improve the architecture.

So now the application has a **CoreModule** which contains all common parts: singleton services, model classes which they use and guards. A **SharedModule** contains all the "dumb" components. It is also a perfect place to import and re-export common Angular and Ionic stuff. And other **FeatureModule**'s, like *AuthModule*, *BookingsModule*, and *PlacesModule* with submodules. Those modules don’t depend on any other features just on services provided by **CoreModule** and components provided by **SharedModule**.

### Added aliases

Aliasing the app and environments folders will enable us to implement clean imports, which will be consistent throughout the application.

By default, the app has ugly imports that look like this: `import { SomeSingletonService} from '../../../core/subpackage1/subpackage2/some-singleton.service'`. That could be changed by configuring `baseUrl` and `paths` properties in the `tsconfig.json` file. And now we could use much shorter `import { SomeSingletonService} from '@app/core'`. Looks better, doesn’t it?

Also, we need to re-export every public entity in the main *index.ts* file. That provides us the possibility to import entities (like `SomeSingletonService` in the example above) directly from the `@app/core` instead of `@app/core/some-package/some-singleton.service`.

### `OnPush`

Changed `ChangeDetectionStrategy` to `OnPush` for all components.  After that, Angular will run change detection for components **only if its input bindings have changed**. 

This is the only choice for making the application *way* faster, and personally,  see no reasons for not using it every time.

### `| async`

Replaced `subscribe()` method with `| async` pipe, where it's possible. That provides us some advantages:

1. `| async` pipe works with `OnPush` change detection out of the box. Unlike the subscribing to observable manually in the `ngOnInit()`.
2. No need to manage unsubscribing at the end of the component life-cycle to avoid memory leaks.

## Getting started

Run `npm start` for a dev server. Navigate to `http://localhost:8100/`. The app will automatically reload if you change any of the source files.