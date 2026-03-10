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
        path: 'register',
        canActivate: [loginGuard],
        loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage)
    },
    {
        path: 'forgot-password',
        canActivate: [loginGuard],
        loadComponent: () => import('./pages/forgot-password-page/forgot-password-page').then((m) => m.ForgotPasswordPage)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password-page/reset-password-page').then((m) => m.ResetPasswordPage)
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./pages/verify-email-page/verify-email-page').then((m) => m.VerifyEmailPage)
    },
    {
        path: 'resend-verification',
        loadComponent: () => import('./pages/resend-verification-page/resend-verification-page').then((m) => m.ResendVerificationPage)
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
