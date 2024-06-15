import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
import { provideHttpClient } from '@angular/common/http';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';

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
    provideAnimations(),
    provideHttpClient(),
    { provide: NZ_I18N, useValue: en_US },
    { provide: NZ_ICONS, useValue: icons },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        lang: 'en',
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '636524100093-lud4g3kbsfpbpn1590nuhrte7jjran5u.apps.googleusercontent.com'
            ),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
  ],
};
