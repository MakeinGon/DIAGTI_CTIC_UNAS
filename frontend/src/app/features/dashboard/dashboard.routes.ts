import { Routes } from '@angular/router';
import { DashboardOverviewComponent } from './pages/overview/overview.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    component: DashboardOverviewComponent,
    title: 'Panel ejecutivo',
  },
];
