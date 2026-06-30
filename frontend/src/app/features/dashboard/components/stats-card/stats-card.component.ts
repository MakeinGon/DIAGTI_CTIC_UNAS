import { Component, computed, input } from '@angular/core';
import { RiesgoColorPipe } from '../../../../shared/pipes/riesgo-color.pipe';
import { NivelRiesgo } from '../../../../core/models/auditoria.model';

@Component({
  selector: 'app-stats-card',
  imports: [RiesgoColorPipe],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css',
})
export class StatsCardComponent {
  titulo = input.required<string>();
  valor = input.required<number>();
  descripcion = input<string>('');
  nivelRiesgo = input<NivelRiesgo | null>(null);
  variacionPorcentual = input<number | null>(null);

  protected readonly variacionTexto = computed(() => {
    const variacion = this.variacionPorcentual();
    if (variacion === null || variacion === undefined) {
      return null;
    }

    const prefijo = variacion > 0 ? '+' : '';
    return `${prefijo}${variacion}% vs. mes anterior`;
  });

  protected readonly variacionPositiva = computed(() => (this.variacionPorcentual() ?? 0) >= 0);
}
