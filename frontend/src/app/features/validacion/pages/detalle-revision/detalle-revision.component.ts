import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  ValidacionService,
  Sistema
} from '../../services/validacion.service';

@Component({
  selector: 'app-detalle-revision',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './detalle-revision.component.html',
  styleUrls: ['./detalle-revision.component.css']
})
export class DetalleRevisionComponent implements OnInit {

  item?: Sistema;
  historial: any[] = [];
  form!: FormGroup;

  constructor(
    public route: ActivatedRoute,
    public svc: ValidacionService,
    public fb: FormBuilder,
    public router: Router
  ) {

    this.form = this.fb.group({
      resultado: ['APROBADO', Validators.required],
      observacion: ['']
    });

  }

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.item = this.svc.getById(id);

    this.historial = this.svc.getValidations(id);

    if (!this.item) {

      alert('Registro no encontrado');

      this.router.navigate(['/validacion']);

      return;
    }

    this.form.get('resultado')?.valueChanges.subscribe(
      (val: string | null) => {
        this.updateObservacionValidator(
          val || 'APROBADO'
        );
      }
    );

    const initialVal =
      this.form.get('resultado')?.value ||
      'APROBADO';

    this.updateObservacionValidator(initialVal);

  }

  updateObservacionValidator(val: string) {

    const obs =
      this.form.get('observacion');

    if (!obs) return;

    if (
      val === 'OBSERVADO' ||
      val === 'RECHAZADO'
    ) {

      obs.setValidators([
        Validators.required,
        Validators.minLength(5)
      ]);

    } else {

      obs.clearValidators();

    }

    obs.updateValueAndValidity();

  }

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    const resultado =
      this.form.value.resultado;

    const observacion =
      this.form.value.observacion;

    let mensaje = '';

    if (resultado === 'APROBADO') {
      mensaje =
        '¿Desea APROBAR este sistema?';
    }

    if (resultado === 'OBSERVADO') {
      mensaje =
        '¿Desea OBSERVAR este sistema?';
    }

    if (resultado === 'RECHAZADO') {
      mensaje =
        '¿Desea RECHAZAR este sistema?';
    }

    const confirmar =
      confirm(mensaje);

    if (!confirmar) {
      return;
    }

    if (!this.item) {
      return;
    }

    this.svc.registerValidation(
      this.item.id,
      resultado,
      observacion
    );

    alert(
      'Validación registrada correctamente'
    );

    this.router.navigate([
      '/validacion'
    ]);

  }

}