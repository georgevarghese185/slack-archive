import { HttpStatus } from '@nestjs/common';
import { SlackArchiveError } from 'src/common/error';

export class InvalidTokenFormat extends SlackArchiveError {
  constructor() {
    super(
      'invalid_token_format',
      'Invalid token format',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
