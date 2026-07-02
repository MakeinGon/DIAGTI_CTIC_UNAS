import { Component } from '@angular/core';

export interface Rol {
  key: string;
  nombre: string;
  descripcion: string;
  usuariosAsignados: number;
  /** Matriz [módulo][columna] -> 1 = permitido, 0 = no permitido.
   *  Columnas: Ver, Crear, Editar, Eliminar, Validar, Exportar */
  permisos: number[][];
}

@Component({
  selector: 'app-roles-permisos',
  templateUrl: './roles-permisos.component.html',
  styleUrls: ['./roles-permisos.component.css']
})
export class RolesPermisosComponent {

  /* ---------- Datos estáticos ---------- */
  modulos: string[] = [
    'Dashboard ejecutivo',
    'Inventario de sistemas',
    'Registro de sistemas',
    'Validación técnica',
    'Evidencias técnicas',
    'Auditoría y trazabilidad',
    'Reportes',
    'Usuarios y roles',
    'Catálogos'
  ];

  columnas: string[] = ['Ver', 'Crear', 'Editar', 'Eliminar', 'Validar', 'Exportar'];

  roles: Rol[] = [
    {
      key: 'admin',
      nombre: 'Administrador CTIC',
      descripcion: 'Usuario con control total del sistema. Administra usuarios, roles, catálogos, parámetros, validaciones y reportes.',
      usuariosAsignados: 1,
      permisos: [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 0, 1]
      ]
    },
    {
      key: 'desarrollo',
      nombre: 'Área de Desarrollo',
      descripcion: 'Registra y actualiza información técnica de los sistemas bajo su responsabilidad.',
      usuariosAsignados: 8,
      permisos: [
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0]
      ]
    },
    {
      key: 'infraestructura',
      nombre: 'Área de Infraestructura',
      descripcion: 'Registra información relacionada con servidores, red, dominios y despliegue.',
      usuariosAsignados: 5,
      permisos: [
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0]
      ]
    },
    {
      key: 'funcional',
      nombre: 'Responsable Funcional',
      descripcion: 'Registra y valida los datos generales del sistema en representación de su área.',
      usuariosAsignados: 6,
      permisos: [
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0]
      ]
    },
    {
      key: 'validador',
      nombre: 'Validador Técnico',
      descripcion: 'Revisa la información registrada y determina si un sistema es aprobado, observado o rechazado.',
      usuariosAsignados: 4,
      permisos: [
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0]
      ]
    },
    {
      key: 'auditor',
      nombre: 'Auditor',
      descripcion: 'Consulta el sistema con fines de control, sin capacidad de edición sobre los registros.',
      usuariosAsignados: 3,
      permisos: [
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0]
      ]
    },
    {
      key: 'directivo',
      nombre: 'Directivo',
      descripcion: 'Consulta indicadores, riesgos y reportes ejecutivos para la toma de decisiones institucionales.',
      usuariosAsignados: 5,
      permisos: [
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    }
  ];

  /* ---------- Estado de UI ---------- */
  selectedRoleKey = 'admin';
  modalRolAbierto = false;

  get selectedRole(): Rol {
    return this.roles.find(r => r.key === this.selectedRoleKey) ?? this.roles[0];
  }

  get totalModulos(): number {
    return this.modulos.length;
  }

  get totalUsuariosConRol(): number {
    return this.roles.reduce((acc, r) => acc + r.usuariosAsignados, 0);
  }

  seleccionarRol(key: string): void {
    this.selectedRoleKey = key;
  }

  abrirModalRol(): void {
    this.modalRolAbierto = true;
  }

  cerrarModalRol(): void {
    this.modalRolAbierto = false;
  }

  guardarRol(): void {
    // Aquí iría la llamada al servicio para crear/editar el rol.
    this.cerrarModalRol();
  }
}
