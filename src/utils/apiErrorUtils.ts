export class ApiError extends Error {
  constructor(
  statusCode: number,
  message: string,
  errors?: Array<{ field: string; message: string }>
) {
  super(message);
  this.statusCode = statusCode;
  this.errors = errors;

  Object.setPrototypeOf(this, ApiError.prototype);

  Error.captureStackTrace?.(this, this.constructor); // ✅ Capture correct stack
}
}