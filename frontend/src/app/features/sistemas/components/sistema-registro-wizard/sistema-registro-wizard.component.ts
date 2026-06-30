import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, merge, startWith } from 'rxjs';
import { SistemasFormService } from '../../../../core/services/sistemas-form.service';

type RegistroWizardStep = 'infraestructura' | 'seguridad';

@Component({
  selector: 'app-sistemas-registro-wizard',
  imports: [RouterOutlet],
  templateUrl: './sistema-registro-wizard.component.html',
  styleUrl: './sistema-registro-wizard.component.css',
})
export class SistemasRegistroWizardComponent {
  // Servicios necesarios para navegación y manejo del formulario.
  private readonly router = inject(Router);
  private readonly sistemasFormService = inject(SistemasFormService);

  // Mensaje mostrado cuando la validación termina correctamente.
  protected readonly mensajeExito = signal<string | null>(null);

  // Formularios de cada paso del wizard.
  protected readonly infraestructuraForm = this.sistemasFormService.infraestructuraForm;
  protected readonly seguridadForm = this.sistemasFormService.seguridadForm;

  // Paso actual derivado de la URL.
  protected readonly currentStep = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.resolveStep(this.router.url)),
      startWith(this.resolveStep(this.router.url)),
    ),
    { initialValue: this.resolveStep(this.router.url) },
  );

  // Estado de validez del paso de infraestructura.
  protected readonly infraestructuraValid = toSignal(
    merge(this.infraestructuraForm.statusChanges, this.infraestructuraForm.valueChanges).pipe(
      map(() => this.infraestructuraForm.valid),
      startWith(this.infraestructuraForm.valid),
    ),
    { initialValue: this.infraestructuraForm.valid },
  );

  // Estado de validez del paso de seguridad.
  protected readonly seguridadValid = toSignal(
    merge(this.seguridadForm.statusChanges, this.seguridadForm.valueChanges).pipe(
      map(() => this.seguridadForm.valid),
      startWith(this.seguridadForm.valid),
    ),
    { initialValue: this.seguridadForm.valid },
  );

  // Limpia el mensaje al cambiar de paso y actualiza el estado del wizard.
  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.mensajeExito.set(null);
        const paso = event.urlAfterRedirects.includes('seguridad') ? 4 : 3;
        this.sistemasFormService.updatePaso(paso);
      });
  }

  // Verifica si el paso actual es válido.
  protected pasoActualValido(): boolean {
    return this.currentStep() === 'infraestructura'
      ? this.infraestructuraValid()
      : this.seguridadValid();
  }

  // Vuelve al paso anterior.
  protected irAnterior(): void {
    this.mensajeExito.set(null);
    void this.router.navigate(['/sistemas/registro/infraestructura']);
  }

  // Avanza o envía la validación según el paso actual.
  protected irSiguiente(): void {
    if (this.currentStep() === 'infraestructura') {
      if (!this.sistemasFormService.isStepValid(3)) {
        return;
      }

      this.mensajeExito.set(null);
      void this.router.navigate(['/sistemas/registro/seguridad']);
      return;
    }

    const payload = this.sistemasFormService.enviarValidacion();
    if (payload) {
      this.mensajeExito.set(
        'Registro validado correctamente. El payload está listo para enviarse al backend.',
      );
    }
  }

  // Cierra el mensaje de éxito.
  protected cerrarMensaje(): void {
    this.mensajeExito.set(null);
  }

  // Indica si el usuario está en el primer paso.
  protected esPrimerPaso(): boolean {
    return this.currentStep() === 'infraestructura';
  }

  // Cambia el texto del botón según el paso.
  protected etiquetaSiguiente(): string {
    return this.currentStep() === 'seguridad' ? 'Enviar validación' : 'Siguiente';
  }

  // Determina el paso según la URL.
  private resolveStep(url: string): RegistroWizardStep {
    return url.includes('seguridad') ? 'seguridad' : 'infraestructura';
  }
}
