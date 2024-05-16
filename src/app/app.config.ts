import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';

const firebaseConfig = {
  apiKey: 'AIzaSyBvHGJLNSULUWjwomFl5GQpPt2ff-TV2gk',
  authDomain: 'street-admin.firebaseapp.com',
  projectId: 'street-admin',
  storageBucket: 'street-admin.appspot.com',
  messagingSenderId: '466201171483',
  appId: '1:466201171483:web:65b0d2cd16c9e5d0670abe',
  measurementId: 'G-RG0XJY5MDR',
};

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  (key) => antDesignIcons[key]
);
registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(FormsModule),
    importProvidersFrom([
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFireDatabaseModule,
    ]),
    provideAnimations(),
    { provide: NZ_I18N, useValue: en_US },
    { provide: NZ_ICONS, useValue: icons },
  ],
};
