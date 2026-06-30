import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'sistemas',
    loadChildren: () =>
      import('./features/sistemas/sistemas.routes').then((m) => m.sistemasRoutes),
  },
  {
    path: '',
    redirectTo: 'dashboard/overview',
    pathMatch: 'full',
  },
];
