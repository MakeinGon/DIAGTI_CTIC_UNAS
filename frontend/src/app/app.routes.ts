import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sistemas',
    loadChildren: () =>
      import('./features/sistemas/sistemas.routes').then((m) => m.sistemasRoutes),
  },
  {
    path: '',
    redirectTo: 'sistemas/registro/infraestructura',
    pathMatch: 'full',
  },
];
