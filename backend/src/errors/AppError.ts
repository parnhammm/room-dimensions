import { ErrorCode, ErrorCodes } from './ErrorCodes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = AppError.getStatusCode(code);
  }

  private static getStatusCode(code: ErrorCode): number {
    switch (code) {
      case ErrorCodes.VALIDATION_ERROR:
        return 400;
      case ErrorCodes.NOT_FOUND:
        return 404;
      case ErrorCodes.INTERNAL_ERROR:
      default:
        return 500;
    }
  }
}
