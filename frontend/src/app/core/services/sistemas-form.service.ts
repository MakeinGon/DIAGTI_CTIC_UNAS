import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import {
  EvidenciaArchivo,
  RegistroPaso,
  SistemaRegistroFormValue,
  SistemaRegistroPayload,
  SistemaRegistroState,
} from '../models/sistema-registro.model';

const INITIAL_STATE: SistemaRegistroState = {
  pasoActual: 1,
  datosGenerales: null,
  arquitectura: null,
  infraestructura: null,
  seguridad: null,
  evidencias: [],
};

@Injectable({ providedIn: 'root' })
export class SistemasFormService {
  private readonly fb = inject(FormBuilder);

  private readonly stateSubject = new BehaviorSubject<SistemaRegistroState>(INITIAL_STATE);

  readonly state$ = this.stateSubject.asObservable();

  readonly form = this.fb.group({
    datosGenerales: this.fb.group({
      codigoUnico: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: this.fb.control<string | null>(null),
      idAreaUsuario: this.fb.control<number | null>(null),
      idTipoAplicativo: this.fb.control<number | null>(null),
      idCriticidad: this.fb.control<number | null>(null),
      formaAdquisicion: this.fb.control<string | null>(null),
      idResponsableFuncional: this.fb.control<number | null>(null),
      idResponsableTecnico: this.fb.control<number | null>(null),
      anoAdquisicion: this.fb.control<number | null>(null),
      desarrolladorNombre: this.fb.control<string | null>(null),
      contratoVigente: this.fb.nonNullable.control(false),
      fechaVencimientoSoporte: this.fb.control<string | null>(null),
      esLegacy: this.fb.nonNullable.control(false),
      estadoFlujo: this.fb.control<string | null>(null),
      nivelRiesgo: this.fb.control<string | null>(null),
      prioridadMigracion: this.fb.control<string | null>(null),
    }),
    arquitectura: this.fb.group({
      tipoArquitectura: ['', [Validators.required, Validators.maxLength(100)]],
      patronArquitectonico: this.fb.control<string | null>(null),
      descripcionTecnica: this.fb.control<string | null>(null),
      observaciones: this.fb.control<string | null>(null),
    }),
    infraestructura: this.fb.group({
      capacidadRecursos: ['', Validators.required],
    }),
    seguridad: this.fb.group({
      tipoControl: ['', [Validators.required, Validators.maxLength(100)]],
      mecanismoAutenticacion: ['', [Validators.required, Validators.maxLength(100)]],
    }),
  });

  get pasoActual(): RegistroPaso {
    return this.stateSubject.value.pasoActual;
  }

  get currentState(): SistemaRegistroState {
    return this.stateSubject.value;
  }

  get evidencias(): EvidenciaArchivo[] {
    return this.stateSubject.value.evidencias;
  }

  get infraestructuraForm(): FormGroup {
    return this.form.controls.infraestructura;
  }

  get seguridadForm(): FormGroup {
    return this.form.controls.seguridad;
  }

  updatePaso(paso: RegistroPaso): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      pasoActual: paso,
    });
  }

  patchStep<K extends keyof Pick<SistemaRegistroState, 'datosGenerales' | 'arquitectura' | 'infraestructura' | 'seguridad'>>(
    step: K,
    value: NonNullable<SistemaRegistroState[K]>,
  ): void {
    const controlKey = step as keyof SistemaRegistroFormValue;
    this.form.controls[controlKey].patchValue(value);
    this.stateSubject.next({
      ...this.stateSubject.value,
      [step]: value,
    });
  }

  addEvidencia(file: File): void {
    const evidencia: EvidenciaArchivo = {
      nombreArchivo: file.name,
      extensionArchivo: this.extractExtension(file.name),
      tamanoArchivo: file.size,
    };

    const evidencias = [...this.stateSubject.value.evidencias, evidencia];
    this.stateSubject.next({
      ...this.stateSubject.value,
      evidencias,
    });
  }

  addEvidencias(files: FileList | File[]): void {
    Array.from(files).forEach((file) => this.addEvidencia(file));
  }

  removeEvidencia(nombreArchivo: string): void {
    const evidencias = this.stateSubject.value.evidencias.filter(
      (evidencia) => evidencia.nombreArchivo !== nombreArchivo,
    );

    this.stateSubject.next({
      ...this.stateSubject.value,
      evidencias,
    });
  }

  isStepValid(paso: RegistroPaso): boolean {
    const stepControl = this.getStepControl(paso);
    stepControl.markAllAsTouched();
    return stepControl.valid;
  }

  getPayload(): SistemaRegistroPayload | null {
    if (!this.isRegistroParcialValido()) {
      return null;
    }

    return this.buildPayload();
  }

  enviarValidacion(): SistemaRegistroPayload | null {
    if (!this.isRegistroParcialValido()) {
      return null;
    }

    const payload = this.buildPayload();
    return payload;
  }

  reset(): void {
    this.form.reset({
      datosGenerales: {
        contratoVigente: false,
        esLegacy: false,
      },
    });
    this.stateSubject.next({ ...INITIAL_STATE });
  }

  private isRegistroParcialValido(): boolean {
    const pasoInfraestructuraValido = this.isStepValid(3);
    const pasoSeguridadValido = this.isStepValid(4);

    return pasoInfraestructuraValido && pasoSeguridadValido;
  }

  private buildPayload(): SistemaRegistroPayload {
    return {
      ...(this.form.getRawValue() as SistemaRegistroFormValue),
      evidencias: this.stateSubject.value.evidencias,
    };
  }

  private extractExtension(nombreArchivo: string): string | null {
    const extension = nombreArchivo.split('.').pop();
    return extension && extension !== nombreArchivo ? extension.toLowerCase() : null;
  }

  private getStepControl(paso: RegistroPaso): FormGroup {
    switch (paso) {
      case 1:
        return this.form.controls.datosGenerales;
      case 2:
        return this.form.controls.arquitectura;
      case 3:
        return this.form.controls.infraestructura;
      case 4:
        return this.form.controls.seguridad;
    }
  }
}
