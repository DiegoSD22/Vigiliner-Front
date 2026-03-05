import { Routes } from '@angular/router';

export const indexRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
];
