import { Route } from '@angular/router';
import { AppRoutes } from '../common/enums/app-routes';

export const dashboardRoutes: Route[] = [
  {
    path: AppRoutes.Home,
    loadComponent: () =>
      import('../pages/dashboard-flow/home/home.component').then(
        m => m.HomeComponent
      ),
    title: 'Dashboard - Smart Clinics Dashboard',
    pathMatch: 'full',
  },
  {
    path: AppRoutes.Patients,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../pages/dashboard-flow/patients/patient-list/patient-list.component'
          ).then(m => m.PatientListComponent),
        title: 'Patients - Smart Clinics Dashboard',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '../pages/dashboard-flow/patients/patient-form/patient-form.component'
          ).then(m => m.PatientFormComponent),
        title: 'Add New Patient - Smart Clinics Dashboard',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '../pages/dashboard-flow/patients/patient-details/patient-details.component'
          ).then(m => m.PatientDetailsComponent),
        title: 'Patient Details - Smart Clinics Dashboard',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '../pages/dashboard-flow/patients/patient-form/patient-form.component'
          ).then(m => m.PatientFormComponent),
        title: 'Edit Patient - Smart Clinics Dashboard',
      },
    ],
  },
];
