import { HttpStatus } from '@nestjs/common';

export class SlackArchiveError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public httpStatus: HttpStatus,
  ) {
    super(message);
  }
}

export class InternalSlackArchiveError extends SlackArchiveError {
  constructor(message: string) {
    super('internal_server_error', message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
