import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

import { AppTheme } from './app-theme';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideRouter(routes),
    MessageService,
    providePrimeNG({
      ripple: true,
      theme: {
        preset: AppTheme,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
      translation: {
        accept: 'Sim',
        reject: 'Não',
        emptyMessage: 'Nenhum resultado encontrado',
        emptyFilterMessage: 'Nenhum resultado encontrado',
      },
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
