import { Routes } from '@angular/router';

export const superDashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/super-dashboard-shell/super-dashboard-shell').then(
        (m) => m.SuperDashboardShell
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/super-overview-page/super-overview-page').then(
            (m) => m.SuperOverviewPage
          ),
      },
      {
        path: 'empresas',
        loadComponent: () =>
          import('./pages/super-companies-page/super-companies-page').then(
            (m) => m.SuperCompaniesPage
          ),
      },
      {
        path: 'unidades',
        loadComponent: () =>
          import('./pages/super-units-page/super-units-page').then(
            (m) => m.SuperUnitsPage
          ),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
