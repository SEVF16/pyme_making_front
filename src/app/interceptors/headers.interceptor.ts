import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HeadersService } from '../services/headers.service';


export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const headersService = inject(HeadersService);
  
  // Obtener headers centralizados
  const headers = headersService.getHeaders();
  
  // Clonar la request y agregar los headers
  const authReq = req.clone({
    setHeaders: headers
  });

  return next(authReq);
};
