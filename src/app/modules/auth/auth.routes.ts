import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { loginGuard } from './guards/login-guard';

export const authRoutes: Routes = [
    {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage)
    },
    {
        path: 'login/mfa',
        canActivate: [loginGuard],
        loadComponent: () => import('./pages/mfa-page/mfa-page').then((m) => m.MfaPage)
    },
    {
        path: 'register',
        canActivate: [loginGuard],
        loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage)
    },
    {
        path: 'register/verify-email',
        loadComponent: () => import('./pages/verify-email-page/verify-email-page').then((m) => m.VerifyEmailPage)
    },
    {
        path: 'forgot-password',
        canActivate: [loginGuard],
        loadComponent: () => import('./pages/forgot-password-page/forgot-password-page').then((m) => m.ForgotPasswordPage)
    },
    {
        path: 'forgot-password/reset-password',
        loadComponent: () => import('./pages/reset-password-page/reset-password-page').then((m) => m.ResetPasswordPage)
    },
    {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/change-password-page/change-password-page').then((m) => m.ChangePasswordPage)
    },
    {
        path: '**',
        redirectTo: 'login',
    }
];
