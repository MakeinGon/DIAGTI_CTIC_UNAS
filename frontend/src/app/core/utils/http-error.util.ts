import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export function getHttpErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique que el backend esté activo.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    return `Error del servidor (${error.status}): ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado al procesar la solicitud.';
}

export function handleHttpError<T>(context: string) {
  return (error: unknown): Observable<T> => {
    const message = getHttpErrorMessage(error);
    console.error(`[${context}]`, error);
    return throwError(() => new Error(message));
  };
}
