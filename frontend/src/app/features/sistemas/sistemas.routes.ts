import { Routes } from '@angular/router';
import { InfraestructuraStepComponent } from './components/paso-infra/infraestructura-step.component';
import { SeguridadStepComponent } from './components/paso-seguridad/seguridad-step.component';
import { SistemasRegistroWizardComponent } from './components/sistema-registro-wizard/sistema-registro-wizard.component';

export const sistemasRoutes: Routes = [
  {
    path: 'registro',
    component: SistemasRegistroWizardComponent,
    children: [
      {
        path: '',
        redirectTo: 'infraestructura',
        pathMatch: 'full',
      },
      {
        path: 'infraestructura',
        component: InfraestructuraStepComponent,
        title: 'Infraestructura tecnológica',
      },
      {
        path: 'seguridad',
        component: SeguridadStepComponent,
        title: 'Seguridad y evidencias',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'registro/infraestructura',
    pathMatch: 'full',
  },
];
