import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SistemasFormService } from '../../../../core/services/sistemas-form.service';

@Component({
  selector: 'app-infraestructura-step',
  imports: [ReactiveFormsModule],
  templateUrl: './infraestructura-step.component.html',
  styleUrl: './infraestructura-step.component.css',
})
export class InfraestructuraStepComponent {
  private readonly sistemasFormService = inject(SistemasFormService);

  protected readonly infraestructuraForm = this.sistemasFormService.infraestructuraForm;
}
