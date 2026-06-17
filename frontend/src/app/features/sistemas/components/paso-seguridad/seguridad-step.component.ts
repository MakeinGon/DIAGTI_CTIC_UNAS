import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { SistemasFormService } from '../../../../core/services/sistemas-form.service';

@Component({
  selector: 'app-seguridad-step',
  imports: [ReactiveFormsModule],
  templateUrl: './seguridad-step.component.html',
  styleUrl: './seguridad-step.component.css',
})
export class SeguridadStepComponent {
  private readonly sistemasFormService = inject(SistemasFormService);

  protected readonly seguridadForm = this.sistemasFormService.seguridadForm;
  protected readonly state = toSignal(this.sistemasFormService.state$, {
    initialValue: this.sistemasFormService.currentState,
  });
  protected readonly isDragOver = signal(false);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.sistemasFormService.addEvidencias(files);
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.sistemasFormService.addEvidencias(input.files);
      input.value = '';
    }
  }

  protected removeEvidencia(nombreArchivo: string): void {
    this.sistemasFormService.removeEvidencia(nombreArchivo);
  }
}
