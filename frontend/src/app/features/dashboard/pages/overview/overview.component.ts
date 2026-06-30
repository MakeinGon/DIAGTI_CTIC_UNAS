import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { DashboardAnalyticsService } from '../../../../core/services/dashboard-analytics.service';
import { DashboardMetrica } from '../../../../core/models/dashboard-metrics.model';
import { AuditLogTableComponent } from '../../components/audit-log-table/audit-log-table.component';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';

type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  labels?: string[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  plotOptions?: ApexPlotOptions;
  legend?: ApexLegend;
  colors?: string[];
};

@Component({
  selector: 'app-dashboard-overview',
  imports: [NgApexchartsModule, StatsCardComponent, AuditLogTableComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class DashboardOverviewComponent implements OnInit {
  private readonly analyticsService = inject(DashboardAnalyticsService);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly metricas = signal<DashboardMetrica[]>([]);
  protected readonly indiceRiesgoGlobal = signal(0);

  protected readonly riesgoChart = signal<ChartOptions | null>(null);
  protected readonly criticidadChart = signal<ChartOptions | null>(null);
  protected readonly actividadChart = signal<ChartOptions | null>(null);

  ngOnInit(): void {
    this.analyticsService.obtenerOverview().subscribe({
      next: (data) => {
        this.metricas.set(data.metricas);
        this.indiceRiesgoGlobal.set(data.indiceRiesgoGlobal);
        this.riesgoChart.set(this.buildRiesgoChart(data.riesgoDistribucion));
        this.criticidadChart.set(this.buildCriticidadChart(data.criticidadDistribucion));
        this.actividadChart.set(this.buildActividadChart(data.actividadAuditoria));
        this.cargando.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  private buildRiesgoChart(
    distribucion: { nivel: string; total: number }[],
  ): ChartOptions {
    return {
      series: distribucion.map((item) => item.total),
      labels: distribucion.map((item) => item.nivel),
      chart: {
        type: 'donut',
        height: 320,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#dc2626', '#d97706', '#16a34a'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true },
      plotOptions: {
        pie: {
          donut: {
            size: '62%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Sistemas',
              },
            },
          },
        },
      },
    };
  }

  private buildCriticidadChart(
    distribucion: { criticidad: string; total: number }[],
  ): ChartOptions {
    return {
      series: [{ name: 'Sistemas', data: distribucion.map((item) => item.total) }],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#2563eb'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '48%',
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: distribucion.map((item) => item.criticidad),
      },
      yaxis: {
        title: { text: 'Cantidad' },
      },
    };
  }

  private buildActividadChart(
    actividad: { fecha: string; total: number }[],
  ): ChartOptions {
    return {
      series: [{ name: 'Eventos', data: actividad.map((item) => item.total) }],
      chart: {
        type: 'area',
        height: 320,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#7c3aed'],
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.8,
          opacityFrom: 0.45,
          opacityTo: 0.05,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: actividad.map((item) => item.fecha),
      },
      yaxis: {
        title: { text: 'Eventos/día' },
      },
    };
  }
}
