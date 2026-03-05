import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () =>  import('./modules/index/index.routes').then((m) => m.indexRoutes)
    },
    {
        path: 'auth',
        loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.authRoutes)
    },
    { path: '**', redirectTo: '' },
];
