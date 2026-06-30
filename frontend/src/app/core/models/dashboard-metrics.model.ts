import { NivelRiesgo } from './auditoria.model';

export interface DashboardMetrica {
  id: string;
  titulo: string;
  valor: number;
  descripcion: string;
  nivelRiesgo?: NivelRiesgo;
  variacionPorcentual?: number;
}

export interface RiesgoDistribucion {
  nivel: NivelRiesgo;
  total: number;
}

export interface CriticidadDistribucion {
  criticidad: string;
  total: number;
}

export interface AuditoriaActividadDiaria {
  fecha: string;
  total: number;
}

export interface DashboardOverviewData {
  metricas: DashboardMetrica[];
  riesgoDistribucion: RiesgoDistribucion[];
  criticidadDistribucion: CriticidadDistribucion[];
  actividadAuditoria: AuditoriaActividadDiaria[];
  indiceRiesgoGlobal: number;
}
