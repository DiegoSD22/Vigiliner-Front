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
          import('./organizations/pages/organizations-page/organizations-page').then(
            (m) => m.OrganizationsPage
          ),
      },
      {
        path: 'empresas/:id',
        loadComponent: () =>
          import('./organizations/pages/organization-detail-page/organization-detail-page').then(
            (m) => m.OrganizationDetailPage
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
