import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/index/index.routes').then((m) => m.indexRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'super-dashboard',
    loadChildren: () =>
      import('./modules/super-dashboard/super-dashboard.routes').then(
        (m) => m.superDashboardRoutes
      ),
  },
  { path: '**', redirectTo: '' },
];
