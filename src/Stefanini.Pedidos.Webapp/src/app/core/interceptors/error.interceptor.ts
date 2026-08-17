import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { mensagemErroHttp } from '../../shared/utils/http-error';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      notifications.error('Não foi possível concluir a operação', mensagemErroHttp(error));
      return throwError(() => error);
    }),
  );
};
