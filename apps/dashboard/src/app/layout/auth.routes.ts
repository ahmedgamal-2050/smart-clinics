import { Route } from '@angular/router';
import { AppRoutes } from '../common/enums/app-routes';

export const authRoutes: Route[] = [
  {
    path: AppRoutes.Login,
    loadComponent: () =>
      import('../pages/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Smart Clinics Dashboard',
    pathMatch: 'full',
  },
];
