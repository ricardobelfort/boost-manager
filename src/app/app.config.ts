import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { provideNgcCookieConsent } from 'ngx-cookieconsent';
import { FilterMatchMode, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { Noir } from 'src/style';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    importProvidersFrom(ToastModule),
    { provide: LOCALE_ID, useValue: 'pt' },
    provideNgcCookieConsent({
      cookie: {
        domain: 'https://boost-manager.vercel.app',
      },
      palette: {
        popup: {
          background: '#232328',
          text: '#fff',
        },
        button: {
          background: '#A3E634',
          text: '#fff',
        },
      },
      position: 'bottom-right',
      theme: 'classic', // ou 'edgeless'
      type: 'info',
      content: {
        message: 'This website uses cookies to ensure you get the best experience on our website.',
        dismiss: 'Got it!',
        allow: 'Allow cookies',
        deny: 'Refuse cookies',
      },
    }),
    MessageService,
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Noir,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind, primeng',
          },
          filterMatchModeOptions: {
            text: [
              FilterMatchMode.STARTS_WITH,
              FilterMatchMode.CONTAINS,
              FilterMatchMode.NOT_CONTAINS,
              FilterMatchMode.ENDS_WITH,
              FilterMatchMode.EQUALS,
              FilterMatchMode.NOT_EQUALS,
            ],
            numeric: [
              FilterMatchMode.EQUALS,
              FilterMatchMode.NOT_EQUALS,
              FilterMatchMode.LESS_THAN,
              FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
              FilterMatchMode.GREATER_THAN,
              FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
            ],
            date: [
              FilterMatchMode.DATE_IS,
              FilterMatchMode.DATE_IS_NOT,
              FilterMatchMode.DATE_BEFORE,
              FilterMatchMode.DATE_AFTER,
            ],
          },
        },
      },
    }),
  ],
};
