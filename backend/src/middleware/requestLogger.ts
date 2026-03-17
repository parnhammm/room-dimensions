import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../config/env';

export const logger = pino({ level: env.LOG_LEVEL });

export const requestLogger = pinoHttp({
  logger,
  genReqId: () => Math.random().toString(36).slice(2),
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
