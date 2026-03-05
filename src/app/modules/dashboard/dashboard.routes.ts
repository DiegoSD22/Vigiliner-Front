import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth-guard';
import { roleGuard } from '../auth/guards/role-guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/admin-dashboard-page/admin-dashboard-page').then(
        (m) => m.AdminDashboardPage
      ),
  },
  { path: '**', redirectTo: '' },
];
