import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-shell/dashboard-shell').then(
        (m) => m.DashboardShell
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin-overview-page/admin-overview-page').then(
            (m) => m.AdminOverviewPage
          ),
      },
      {
        path: 'unidades',
        loadComponent: () =>
          import('./pages/admin-dashboard-page/admin-dashboard-page').then(
            (m) => m.AdminDashboardPage
          ),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
