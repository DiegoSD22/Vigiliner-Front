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
        path: 'mapa',
        loadComponent: () =>
          import('./modules/map/pages/admin-units-map-page/admin-units-map-page').then(
            (m) => m.AdminUnitsMapPage
          ),
      },
      {
        path: 'unidades',
        loadComponent: () =>
          import('./modules/units/pages/list-all-units-page/list-all-units-page.component').then(
            (m) => m.ListAllUnitsPageComponent
          ),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
