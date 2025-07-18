import { Route } from '@angular/router';
import { AppRoutes } from './common/enums/app-routes';
import { authRoutes } from './layout/auth.routes';
import { dashboardRoutes } from './layout/dashboard.routes';

export const appRoutes: Route[] = [
  {
    path: AppRoutes.Auth,
    loadComponent: () =>
      import('./layout/auth/auth.component').then(c => c.AuthComponent),
    children: [...authRoutes],
  },
  {
    path: AppRoutes.Dashboard,
    loadComponent: () =>
      import('./layout/dashboard/dashboard.component').then(
        m => m.DashboardComponent
      ),
    children: [...dashboardRoutes],
  },
  {
    path: '',
    redirectTo: `/${AppRoutes.Auth}/${AppRoutes.Login}`,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: `/${AppRoutes.Auth}/${AppRoutes.Login}`,
  },
];
