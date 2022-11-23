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
