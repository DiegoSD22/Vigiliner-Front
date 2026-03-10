import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideMapboxGL } from 'ngx-mapbox-gl';

import { App } from '@vigiliner/app';
import { routes } from '@vigiliner/app.routes';
import { jwtInterceptor } from '@vigiliner/auth/interceptors/jwt-interceptor';
import { environment } from '@vigiliner/env/environment';

bootstrapApplication(App, {
  providers: [
    provideMapboxGL({
      accessToken: environment.MAPBOX_API_KEY,
    }),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter(routes)],
}).catch((err) => console.error(err));
