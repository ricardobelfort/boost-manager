import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { FilterMatchMode, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { Noir } from 'src/style';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    importProvidersFrom(ToastModule),
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
