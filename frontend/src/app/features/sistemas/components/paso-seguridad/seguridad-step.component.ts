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
  // Servicio compartido para manejar el estado y datos del wizard.
  private readonly sistemasFormService = inject(SistemasFormService);

  // Formulario reactivo de la etapa de seguridad.
  protected readonly seguridadForm = this.sistemasFormService.seguridadForm;

  // Estado actual del proceso para actualizar la UI.
  protected readonly state = toSignal(this.sistemasFormService.state$, {
    initialValue: this.sistemasFormService.currentState,
  });

  // Indica si el área de carga está resaltada.
  protected readonly isDragOver = signal(false);

  // Marca el área como activa al arrastrar archivos.
  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  // Quita el resaltado cuando el arrastre sale del área.
  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  // Agrega los archivos soltados al formulario.
  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.sistemasFormService.addEvidencias(files);
    }
  }

  // Añade archivos seleccionados desde el input.
  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.sistemasFormService.addEvidencias(input.files);
      input.value = '';
    }
  }

  // Elimina una evidencia de la lista.
  protected removeEvidencia(nombreArchivo: string): void {
    this.sistemasFormService.removeEvidencia(nombreArchivo);
  }
}
