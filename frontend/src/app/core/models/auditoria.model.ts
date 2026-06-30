export type NivelRiesgo = 'ALTO' | 'MEDIO' | 'BAJO';

export interface AuditoriaLog {
  idAuditoria: number;
  idUsuario: number | null;
  nombreUsuario: string;
  modulo: string;
  accion: string;
  descripcion: string | null;
  fechaEvento: string;
  direccionIp: string | null;
}

export interface AuditoriaFiltros {
  modulo: string;
  accion: string;
  busqueda: string;
}

export interface AuditoriaCatalogos {
  modulos: string[];
  acciones: string[];
}
