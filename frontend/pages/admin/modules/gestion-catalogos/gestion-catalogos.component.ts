import { Component } from '@angular/core';

export interface ItemCatalogo {
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Catalogo {
  key: string;
  titulo: string;
  descripcion: string;
  items: ItemCatalogo[];
}

@Component({
  selector: 'app-gestion-catalogos',
  templateUrl: './gestion-catalogos.component.html',
  styleUrls: ['./gestion-catalogos.component.css']
})
export class GestionCatalogosComponent {

  /* ---------- Datos estáticos ---------- */
  catalogos: Catalogo[] = [
    {
      key: 'areas',
      titulo: 'Áreas usuarias',
      descripcion: 'Áreas de la universidad que utilizan o son dueñas de un sistema.',
      items: [
        { codigo: 'AR-01', nombre: 'Dirección Académica', descripcion: 'Matrícula, notas y currícula', activo: true },
        { codigo: 'AR-02', nombre: 'Secretaría General', descripcion: 'Trámites y documentación', activo: true },
        { codigo: 'AR-03', nombre: 'Recursos Humanos', descripcion: 'Personal y planillas', activo: true },
        { codigo: 'AR-04', nombre: 'Economía y Finanzas', descripcion: 'Presupuesto y tesorería', activo: true },
        { codigo: 'AR-05', nombre: 'Bienestar Universitario', descripcion: 'Servicios estudiantiles', activo: true },
        { codigo: 'AR-06', nombre: 'Investigación', descripcion: 'Proyectos y publicaciones', activo: false }
      ]
    },
    {
      key: 'tipos',
      titulo: 'Tipos de aplicativo',
      descripcion: 'Clasificación técnica del sistema registrado.',
      items: [
        { codigo: 'TA-01', nombre: 'Web', descripcion: 'Aplicación accesible por navegador', activo: true },
        { codigo: 'TA-02', nombre: 'Desktop', descripcion: 'Aplicación de escritorio', activo: true },
        { codigo: 'TA-03', nombre: 'API', descripcion: 'Servicio de integración', activo: true },
        { codigo: 'TA-04', nombre: 'Legacy', descripcion: 'Sistema heredado / obsoleto', activo: true }
      ]
    },
    {
      key: 'estados',
      titulo: 'Estados de levantamiento',
      descripcion: 'Estados por los que atraviesa el registro de un sistema.',
      items: [
        { codigo: 'ES-01', nombre: 'Borrador', descripcion: 'Registro en edición', activo: true },
        { codigo: 'ES-02', nombre: 'Enviado', descripcion: 'Enviado a validación técnica', activo: true },
        { codigo: 'ES-03', nombre: 'Observado', descripcion: 'Con observaciones pendientes', activo: true },
        { codigo: 'ES-04', nombre: 'Subsanado', descripcion: 'Observaciones levantadas', activo: true },
        { codigo: 'ES-05', nombre: 'Validado', descripcion: 'Aprobado por CTIC', activo: true },
        { codigo: 'ES-06', nombre: 'Rechazado', descripcion: 'No aprobado', activo: true },
        { codigo: 'ES-07', nombre: 'Cerrado', descripcion: 'Proceso finalizado', activo: true }
      ]
    },
    {
      key: 'criticidad',
      titulo: 'Criticidades',
      descripcion: 'Nivel de importancia institucional del sistema.',
      items: [
        { codigo: 'CR-01', nombre: 'Académico', descripcion: 'Procesos académicos centrales', activo: true },
        { codigo: 'CR-02', nombre: 'Financiero', descripcion: 'Procesos económicos y contables', activo: true },
        { codigo: 'CR-03', nombre: 'RRHH', descripcion: 'Gestión de personal', activo: true }
      ]
    },
    {
      key: 'tecnologias',
      titulo: 'Tecnologías',
      descripcion: 'Lenguajes y frameworks reconocidos por el sistema.',
      items: [
        { codigo: 'TE-01', nombre: 'PHP / Laravel', descripcion: 'Framework backend', activo: true },
        { codigo: 'TE-02', nombre: 'Java / Spring Boot', descripcion: 'Framework backend', activo: true },
        { codigo: 'TE-03', nombre: 'Visual Basic', descripcion: 'Tecnología legacy', activo: true },
        { codigo: 'TE-04', nombre: 'Python / Django', descripcion: 'Framework backend', activo: true },
        { codigo: 'TE-05', nombre: '.NET / C#', descripcion: 'Framework backend', activo: true },
        { codigo: 'TE-06', nombre: 'React', descripcion: 'Framework frontend', activo: true },
        { codigo: 'TE-07', nombre: 'Angular', descripcion: 'Framework frontend', activo: true },
        { codigo: 'TE-08', nombre: 'Vue.js', descripcion: 'Framework frontend', activo: true }
      ]
    },
    {
      key: 'motores',
      titulo: 'Motores de base de datos',
      descripcion: 'Motores permitidos para el registro de arquitectura.',
      items: [
        { codigo: 'BD-01', nombre: 'PostgreSQL', descripcion: 'Motor relacional', activo: true },
        { codigo: 'BD-02', nombre: 'MySQL', descripcion: 'Motor relacional', activo: true },
        { codigo: 'BD-03', nombre: 'SQL Server', descripcion: 'Motor relacional', activo: true },
        { codigo: 'BD-04', nombre: 'Oracle', descripcion: 'Motor relacional', activo: true },
        { codigo: 'BD-05', nombre: 'Access', descripcion: 'Motor legacy', activo: true }
      ]
    },
    {
      key: 'evidencias',
      titulo: 'Tipos de evidencia',
      descripcion: 'Documentos requeridos para sustentar cada sistema.',
      items: [
        { codigo: 'EV-01', nombre: 'Contrato', descripcion: 'Documento contractual', activo: true },
        { codigo: 'EV-02', nombre: 'Repositorio Git', descripcion: 'Enlace a control de versiones', activo: true },
        { codigo: 'EV-03', nombre: 'Backup', descripcion: 'Constancia de respaldo', activo: true },
        { codigo: 'EV-04', nombre: 'Certificado SSL', descripcion: 'Certificado de seguridad', activo: true },
        { codigo: 'EV-05', nombre: 'Manual técnico', descripcion: 'Documentación técnica', activo: true },
        { codigo: 'EV-06', nombre: 'Acta de conformidad', descripcion: 'Documento de aceptación', activo: true }
      ]
    },
    {
      key: 'adquisicion',
      titulo: 'Formas de adquisición',
      descripcion: 'Origen del desarrollo o compra del sistema.',
      items: [
        { codigo: 'AQ-01', nombre: 'Desarrollo interno CTIC', descripcion: 'Elaborado por CTIC', activo: true },
        { codigo: 'AQ-02', nombre: 'Proveedor externo', descripcion: 'Contratado a terceros', activo: true },
        { codigo: 'AQ-03', nombre: 'Convenio', descripcion: 'Adquirido por convenio institucional', activo: true },
        { codigo: 'AQ-04', nombre: 'Compra directa', descripcion: 'Adquisición comercial', activo: true }
      ]
    },
    {
      key: 'riesgo',
      titulo: 'Niveles de riesgo',
      descripcion: 'Escala usada para priorizar la modernización de sistemas.',
      items: [
        { codigo: 'RI-01', nombre: 'Bajo', descripcion: 'Riesgo controlado', activo: true },
        { codigo: 'RI-02', nombre: 'Medio', descripcion: 'Riesgo moderado', activo: true },
        { codigo: 'RI-03', nombre: 'Alto', descripcion: 'Riesgo relevante', activo: true },
        { codigo: 'RI-04', nombre: 'Crítico', descripcion: 'Atención inmediata', activo: true }
      ]
    }
  ];

  /* ---------- Estado de UI ---------- */
  selectedCatKey = 'areas';
  modalItemAbierto = false;

  get selectedCatalogo(): Catalogo {
    return this.catalogos.find(c => c.key === this.selectedCatKey) ?? this.catalogos[0];
  }

  seleccionarCatalogo(key: string): void {
    this.selectedCatKey = key;
  }

  abrirModalItem(): void {
    this.modalItemAbierto = true;
  }

  cerrarModalItem(): void {
    this.modalItemAbierto = false;
  }

  guardarItem(): void {
    // Aquí iría la llamada al servicio para crear/editar el ítem de catálogo.
    this.cerrarModalItem();
  }

  eliminarItem(catalogo: Catalogo, item: ItemCatalogo): void {
    catalogo.items = catalogo.items.filter(i => i !== item);
  }
}
