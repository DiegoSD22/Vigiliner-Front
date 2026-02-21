import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard'
import { AuthGuard } from './auth/auth-guard';
import { Login } from './auth/login/login';
import { loginGuard } from './auth/login-guard';

export const routes: Routes = [
    { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
    { path: 'login', component: Login, canActivate: [loginGuard] },
];
