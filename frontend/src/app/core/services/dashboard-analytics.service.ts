import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardOverviewData } from '../models/dashboard-metrics.model';
import { handleHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  obtenerOverview(): Observable<DashboardOverviewData> {
    return this.http
      .get<DashboardOverviewData>(`${this.baseUrl}/overview`)
      .pipe(
        catchError(handleHttpError<DashboardOverviewData>('DashboardAnalyticsService.obtenerOverview')),
      );
  }
}
