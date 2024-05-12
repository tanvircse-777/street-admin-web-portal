import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideNzIcons } from './icons-provider';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
// import { AngularFireAuthModule } from '@angular/fire/compat/auth';
// import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
const firebaseConfig = {
  apiKey: 'AIzaSyBvHGJLNSULUWjwomFl5GQpPt2ff-TV2gk',
  authDomain: 'street-admin.firebaseapp.com',
  projectId: 'street-admin',
  storageBucket: 'street-admin.appspot.com',
  messagingSenderId: '466201171483',
  appId: '1:466201171483:web:65b0d2cd16c9e5d0670abe',
  measurementId: 'G-RG0XJY5MDR',
};
registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideNzIcons(),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    importProvidersFrom([
      AngularFireModule.initializeApp(firebaseConfig),
      // AngularFireAuthModule,
      AngularFireDatabaseModule,
      // AngularFirestoreModule,
    ]),
    provideAnimations(),
  ],
};
