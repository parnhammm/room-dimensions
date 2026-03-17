import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';

export function validateDto<T extends object>(DtoClass: ClassConstructor<T>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      const messages = errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('; ');
      next(new AppError(ErrorCodes.VALIDATION_ERROR, messages));
      return;
    }

    req.body = instance;
    next();
  };
}
