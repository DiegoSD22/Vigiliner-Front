import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const access_token = localStorage.getItem('access_token');

  if (access_token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${access_token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
