import { HttpStatus } from '@nestjs/common';
import { SlackArchiveError } from 'src/common/error';

export class InvalidVerificationCodeError extends SlackArchiveError {
  constructor() {
    super('invalid_code', 'Invalid verification code', HttpStatus.BAD_REQUEST);
  }
}

export class SpentVerificationCodeError extends SlackArchiveError {
  constructor() {
    super(
      'code_already_used',
      'Provided code has already been used before',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
