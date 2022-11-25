import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Logger } from '../logger/logger';
import { SlackArchiveError } from './error';

@Catch()
export class DefaultExceptionFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let code: string;
    let message: string;
    let status: number;

    if (error instanceof HttpException) {
      throw error;
    } else if (error instanceof SlackArchiveError) {
      code = error.code;
      message = error.message;
      status = error.httpStatus;
    } else {
      code = 'internal_server_error';
      message = 'Unexpected Error';
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    this.logger.error(error.stack || error);

    response.status(status).json({
      errorCode: code,
      message,
    });
  }
}
