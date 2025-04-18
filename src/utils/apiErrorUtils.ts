export class ApiError extends Error {
  public statusCode: number;
  public errors?: Array<{ field: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // For extending built-in classes
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
