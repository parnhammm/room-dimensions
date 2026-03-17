import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred.',
    },
  });
}
