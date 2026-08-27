/**
 * Errores de dominio con código HTTP asociado, para mapearlos en las rutas.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

/** Regla de negocio violada (p. ej. transición inválida, promo finalizada). */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 409);
  }
}
