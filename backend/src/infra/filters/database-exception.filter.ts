import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../database/generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DATABASE ERROR');

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.getStatus(exception);
    const message = this.getMessage(exception);

    this.logger.error(`${exception.code}: ${exception.message}`);

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }

  private getStatus(exception: Prisma.PrismaClientKnownRequestError): number {
    switch (exception.code) {
      case 'P1001':
        return 503;

      default:
        return 500;
    }
  }

  private getMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    switch (exception.code) {
      case 'P1001':
        return 'Banco de dados inacessível';

      default:
        return 'Erro interno do servidor';
    }
  }
}
