import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, finalize, map, of, startWith, switchMap, tap } from 'rxjs';
import { AuditoriaLog } from '../../../../core/models/auditoria.model';
import { AuditoriaService } from '../../../../core/services/auditoria.service';

@Component({
  selector: 'app-audit-log-table',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './audit-log-table.component.html',
  styleUrl: './audit-log-table.component.css',
})
export class AuditLogTableComponent {
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly fb = inject(FormBuilder);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly paginaActual = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly totalElementos = signal(0);
  protected readonly modulos = signal<string[]>([]);
  protected readonly acciones = signal<string[]>([]);

  protected readonly filtrosForm = this.fb.nonNullable.group({
    modulo: '',
    accion: '',
    busqueda: '',
  });

  protected readonly registros = toSignal(
    this.filtrosForm.valueChanges.pipe(
      startWith(this.filtrosForm.getRawValue()),
      debounceTime(200),
      tap(() => {
        this.cargando.set(true);
        this.error.set(null);
        this.paginaActual.set(0);
      }),
      switchMap((filtros) =>
        this.auditoriaService.obtenerBitacora(filtros, this.paginaActual(), 20).pipe(
          tap((page) => {
            this.totalPaginas.set(page.totalPages);
            this.totalElementos.set(page.totalElements);
          }),
          map((page) => page.content),
          catchError((err: Error) => {
            this.error.set(err.message);
            return of([] as AuditoriaLog[]);
          }),
          finalize(() => this.cargando.set(false)),
        ),
      ),
    ),
    { initialValue: [] as AuditoriaLog[] },
  );

  constructor() {
    this.auditoriaService
      .obtenerCatalogos()
      .pipe(
        takeUntilDestroyed(),
        catchError((err: Error) => {
          this.error.set(err.message);
          return of({ modulos: [], acciones: [] });
        }),
      )
      .subscribe((catalogos) => {
        this.modulos.set(catalogos.modulos);
        this.acciones.set(catalogos.acciones);
      });
  }

  protected limpiarFiltros(): void {
    this.filtrosForm.reset({
      modulo: '',
      accion: '',
      busqueda: '',
    });
  }
}
