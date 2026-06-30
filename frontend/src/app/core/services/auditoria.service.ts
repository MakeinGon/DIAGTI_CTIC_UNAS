import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AuditoriaCatalogos,
  AuditoriaFiltros,
  AuditoriaLog,
} from '../models/auditoria.model';
import { PageResponse } from '../models/page.model';
import { handleHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auditoria`;

  obtenerBitacora(
    filtros?: Partial<AuditoriaFiltros>,
    page = 0,
    size = 20,
  ): Observable<PageResponse<AuditoriaLog>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (filtros?.modulo) {
      params = params.set('modulo', filtros.modulo);
    }

    if (filtros?.accion) {
      params = params.set('accion', filtros.accion);
    }

    if (filtros?.busqueda?.trim()) {
      params = params.set('busqueda', filtros.busqueda.trim());
    }

    return this.http
      .get<PageResponse<AuditoriaLog>>(this.baseUrl, { params })
      .pipe(catchError(handleHttpError<PageResponse<AuditoriaLog>>('AuditoriaService.obtenerBitacora')));
  }

  obtenerCatalogos(): Observable<AuditoriaCatalogos> {
    return this.http
      .get<AuditoriaCatalogos>(`${this.baseUrl}/catalogos`)
      .pipe(catchError(handleHttpError<AuditoriaCatalogos>('AuditoriaService.obtenerCatalogos')));
  }
}
