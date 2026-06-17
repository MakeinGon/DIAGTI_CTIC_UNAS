export type RegistroPaso = 1 | 2 | 3 | 4;

export interface DatosGeneralesForm {
  codigoUnico: string;
  nombre: string;
  descripcion: string | null;
  idAreaUsuario: number | null;
  idTipoAplicativo: number | null;
  idCriticidad: number | null;
  formaAdquisicion: string | null;
  idResponsableFuncional: number | null;
  idResponsableTecnico: number | null;
  anoAdquisicion: number | null;
  desarrolladorNombre: string | null;
  contratoVigente: boolean;
  fechaVencimientoSoporte: string | null;
  esLegacy: boolean;
  estadoFlujo: string | null;
  nivelRiesgo: string | null;
  prioridadMigracion: string | null;
}

export interface ArquitecturaForm {
  tipoArquitectura: string;
  patronArquitectonico: string | null;
  descripcionTecnica: string | null;
  observaciones: string | null;
}

export interface InfraestructuraForm {
  capacidadRecursos: string;
}

export interface SeguridadForm {
  tipoControl: string;
  mecanismoAutenticacion: string;
}

export interface EvidenciaArchivo {
  nombreArchivo: string;
  extensionArchivo: string | null;
  tamanoArchivo: number | null;
}

export interface SistemaRegistroState {
  pasoActual: RegistroPaso;
  datosGenerales: DatosGeneralesForm | null;
  arquitectura: ArquitecturaForm | null;
  infraestructura: InfraestructuraForm | null;
  seguridad: SeguridadForm | null;
  evidencias: EvidenciaArchivo[];
}

export interface SistemaRegistroFormValue {
  datosGenerales: DatosGeneralesForm;
  arquitectura: ArquitecturaForm;
  infraestructura: InfraestructuraForm;
  seguridad: SeguridadForm;
}

export interface SistemaRegistroPayload extends SistemaRegistroFormValue {
  evidencias: EvidenciaArchivo[];
}
