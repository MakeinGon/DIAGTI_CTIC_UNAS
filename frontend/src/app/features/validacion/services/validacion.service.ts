import { Injectable } from '@angular/core';

export type Estado = 'ENVIADO' | 'APROBADO' | 'OBSERVADO' | 'RECHAZADO';

export interface Sistema {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
  responsable?: string;
  estado: Estado;
  riesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  evidencias: number;
  arquitectura?: { lenguaje?: string; framework?: string; bd?: string };
  infraestructura?: { servidor?: string; docker?: boolean; ssl?: boolean; dominio?: string };
  archivos?: string[];
}

@Injectable({ providedIn: 'root' })
export class ValidacionService {
  private data: Sistema[] = [
    { id: 1, codigo: 'SIS-MAT-01', nombre: 'Sistema Matrícula', area: 'Académica', responsable: 'Ing. Pérez', estado: 'ENVIADO', riesgo: 'MEDIO', evidencias: 5, arquitectura: { lenguaje: 'Java', framework: 'Spring Boot', bd: 'PostgreSQL' }, infraestructura: { servidor: 'vm-01', docker: true, ssl: true, dominio: 'mat.unas.edu.pe' }, archivos: ['diagrama.pdf','readme.md'] },
    { id: 2, codigo: 'SIS-BIB-02', nombre: 'Sistema Biblioteca', area: 'Académica', responsable: 'Sra. Gómez', estado: 'ENVIADO', riesgo: 'BAJO', evidencias: 3, arquitectura: { lenguaje: 'PHP', framework: 'Laravel', bd: 'MySQL' }, infraestructura: { servidor: 'vm-02', docker: false, ssl: false, dominio: 'bib.unas.edu.pe' }, archivos: ['evidencia1.png']},
    { id: 3, codigo: 'SIS-ADM-03', nombre: 'Sistema Administrativo', area: 'Administración', responsable: 'M. Ruiz', estado: 'OBSERVADO', riesgo: 'ALTO', evidencias: 8, arquitectura: { lenguaje: 'C#', framework: '.NET', bd: 'SQL Server' }, infraestructura: { servidor: 'adm-srv', docker: true, ssl: true, dominio: 'adm.unas.edu.pe' }, archivos: ['arch1.zip','logs.txt']},
    { id: 4, codigo: 'SIS-REC-04', nombre: 'Sistema de Recursos', area: 'RRHH', responsable: 'J. Flores', estado: 'RECHAZADO', riesgo: 'CRITICO', evidencias: 2, arquitectura: { lenguaje: 'Python', framework: 'Django', bd: 'PostgreSQL' }, infraestructura: { servidor: 'rec-srv', docker: false, ssl: false, dominio: 'rec.unas.edu.pe' }, archivos: []},
    { id: 5, codigo: 'SIS-EVA-05', nombre: 'Sistema de Evaluación', area: 'Académica', responsable: 'L. Torres', estado: 'APROBADO', riesgo: 'BAJO', evidencias: 6, arquitectura: { lenguaje: 'JavaScript', framework: 'Node/Express', bd: 'MongoDB' }, infraestructura: { servidor: 'node-1', docker: true, ssl: true, dominio: 'eva.unas.edu.pe' }, archivos: ['evidence.pdf']},
    { id: 6, codigo: 'SIS-PAG-06', nombre: 'Portal de Pagos', area: 'Tesorería', responsable: 'R. Vásquez', estado: 'ENVIADO', riesgo: 'ALTO', evidencias: 4, arquitectura: { lenguaje: 'Java', framework: 'Spring MVC', bd: 'Oracle' }, infraestructura: { servidor: 'pay-srv', docker: true, ssl: true, dominio: 'pagos.unas.edu.pe' }, archivos: ['invoice.pdf']},
    { id: 7, codigo: 'SIS-SEG-07', nombre: 'Seguridad', area: 'TI', responsable: 'C. Herrera', estado: 'ENVIADO', riesgo: 'CRITICO', evidencias: 7, arquitectura: { lenguaje: 'Go', framework: 'Gin', bd: 'PostgreSQL' }, infraestructura: { servidor: 'sec-01', docker: true, ssl: true, dominio: 'seg.unas.edu.pe' }, archivos: ['report.pdf']},
    { id: 8, codigo: 'SIS-INT-08', nombre: 'Integraciones', area: 'TI', responsable: 'F. Salas', estado: 'OBSERVADO', riesgo: 'MEDIO', evidencias: 5, arquitectura: { lenguaje: 'Node', framework: 'Nest', bd: 'MySQL' }, infraestructura: { servidor: 'int-01', docker: false, ssl: false, dominio: 'int.unas.edu.pe' }, archivos: ['spec.docx']},
    { id: 9, codigo: 'SIS-ALM-09', nombre: 'Almacén', area: 'Logística', responsable: 'G. López', estado: 'APROBADO', riesgo: 'BAJO', evidencias: 2, arquitectura: { lenguaje: 'PHP', framework: 'Symfony', bd: 'MariaDB' }, infraestructura: { servidor: 'alm-01', docker: false, ssl: true, dominio: 'alm.unas.edu.pe' }, archivos: []},
    { id: 10, codigo: 'SIS-INV-10', nombre: 'Inventario', area: 'Logística', responsable: 'P. Mendoza', estado: 'ENVIADO', riesgo: 'MEDIO', evidencias: 4, arquitectura: { lenguaje: 'Ruby', framework: 'Rails', bd: 'Postgres' }, infraestructura: { servidor: 'inv-srv', docker: false, ssl: false, dominio: 'inv.unas.edu.pe' }, archivos: ['schema.png']},
  ];

  private validations: any[] = [];

  getValidations(id: number) {
  return this.validations.filter(
    v => v.id === id
  );
  }

  getHistorial(id: number) {
  return this.validations.filter(v => v.id === id);
  } 
  constructor() {}

  getAll(): Sistema[] {
    return [...this.data];
  }

  getById(id: number): Sistema | undefined {
    return this.data.find((d) => d.id === id);
  }

  registerValidation(id: number, resultado: Estado, observacion?: string) {

  const item = this.getById(id);

  if (!item) {
    throw new Error('No encontrado');
  }

  item.estado = resultado;

  this.validations.push({
    id,
    resultado,
    observacion,
    fecha: new Date().toLocaleString()
  });

  }
}
