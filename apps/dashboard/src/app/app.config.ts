import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
  provideAppInitializer,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { AppStorage } from './common/enums/app-storage';

const DEFAULT_LANGUAGE = 'en';

export function preloadTranslation(transloco: TranslocoService) {
  return function () {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    const savedLang = isBrowser
      ? localStorage.getItem(AppStorage.language) ?? DEFAULT_LANGUAGE
      : DEFAULT_LANGUAGE;

    transloco.setActiveLang(savedLang);

    if (isBrowser) {
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    }

    return transloco.load(savedLang);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideTransloco({
      config: {
        availableLangs: ['en', 'ar'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      const initializerFn = preloadTranslation(inject(TranslocoService));
      return initializerFn();
    }),
  ],
};
