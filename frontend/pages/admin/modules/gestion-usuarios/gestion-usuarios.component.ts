import { Component } from '@angular/core';

export type BadgeTone = 'brand' | 'gray' | 'med' | 'high' | 'crit' | 'info' | 'low';

export interface Usuario {
  iniciales: string;
  nombre: string;
  correo: string;
  dni: string;
  area: string;
  rol: string;
  rolBadge: BadgeTone;
  origen: 'LDAP' | 'Local';
  ultimoAcceso: string;
  activo: boolean;
}

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent {

  /* ---------- Datos estáticos ---------- */
  totalUsuarios = 32;
  usuariosActivos = 27;
  usuariosInactivos = 5;
  usuariosLdap = 24;

  roles: string[] = [
    'Administrador CTIC',
    'Área de Desarrollo',
    'Área de Infraestructura',
    'Validador Técnico',
    'Auditor',
    'Directivo'
  ];

  areas: string[] = [
    'Área de Desarrollo',
    'Área de Infraestructura',
    'Dirección Académica',
    'CTIC – Control interno',
    'Rectorado'
  ];

  usuarios: Usuario[] = [
    {
      iniciales: 'JP', nombre: 'Juan Perez', correo: 'jperez@unas.edu.pe',
      dni: '12345678', area: 'Área de Desarrollo', rol: 'Desarrollo', rolBadge: 'brand',
      origen: 'LDAP', ultimoAcceso: '01/07/2026 08:12', activo: true
    },
    {
      iniciales: 'AC', nombre: 'Auditor CTIC', correo: 'auditor@unas.edu.pe',
      dni: '87654321', area: 'CTIC – Control interno', rol: 'Auditor', rolBadge: 'gray',
      origen: 'LDAP', ultimoAcceso: '30/06/2026 17:45', activo: true
    },
    {
      iniciales: 'MR', nombre: 'María Rojas', correo: 'mrojas@unas.edu.pe',
      dni: '44556677', area: 'Área de Infraestructura', rol: 'Infraestructura', rolBadge: 'med',
      origen: 'LDAP', ultimoAcceso: '29/06/2026 11:03', activo: true
    },
    {
      iniciales: 'LS', nombre: 'Luis Sánchez', correo: 'lsanchez@unas.edu.pe',
      dni: '33221144', area: 'Dirección Académica', rol: 'Validador Técnico', rolBadge: 'high',
      origen: 'Local', ultimoAcceso: '18/06/2026 09:27', activo: false
    },
    {
      iniciales: 'PD', nombre: 'Patricia Dávila', correo: 'pdavila@unas.edu.pe',
      dni: '29384756', area: 'Rectorado', rol: 'Directivo', rolBadge: 'crit',
      origen: 'LDAP', ultimoAcceso: '27/06/2026 14:50', activo: true
    }
  ];

  /* ---------- Estado de UI ---------- */
  modalUsuarioAbierto = false;
  filtroTexto = '';
  filtroRol = 'Todos los roles';
  filtroEstado = 'Todos los estados';
  filtroOrigen = 'Todo origen';

  abrirModalUsuario(): void {
    this.modalUsuarioAbierto = true;
  }

  cerrarModalUsuario(): void {
    this.modalUsuarioAbierto = false;
  }

  toggleEstado(usuario: Usuario): void {
    usuario.activo = !usuario.activo;
  }

  guardarUsuario(): void {
    // Aquí iría la llamada al servicio para crear/editar el usuario.
    this.cerrarModalUsuario();
  }
}
