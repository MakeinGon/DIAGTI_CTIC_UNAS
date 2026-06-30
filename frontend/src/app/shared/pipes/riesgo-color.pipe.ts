import { Pipe, PipeTransform } from '@angular/core';
import { NivelRiesgo } from '../../core/models/auditoria.model';

@Pipe({
  name: 'riesgoColor',
})
export class RiesgoColorPipe implements PipeTransform {
  transform(nivel: NivelRiesgo | string | null | undefined): string {
    switch (nivel) {
      case 'ALTO':
        return 'riesgo-alto';
      case 'MEDIO':
        return 'riesgo-medio';
      case 'BAJO':
        return 'riesgo-bajo';
      default:
        return 'riesgo-neutral';
    }
  }
}
