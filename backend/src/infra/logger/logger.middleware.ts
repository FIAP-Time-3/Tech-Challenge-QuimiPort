import { Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('APP');
  }
  use(req: Request, res: Response, next: NextFunction) {
    const init = new Date().getTime();

    const { method, baseUrl } = req;
    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      const ping = new Date().getTime() - init;
      this.logger.log(
        `${statusCode} ${statusMessage} | ${ping}ms | ${method} > ${baseUrl} `,
      );
    });

    next();
  }
}
