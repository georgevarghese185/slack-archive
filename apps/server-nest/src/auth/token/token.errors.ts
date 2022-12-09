import { HttpStatus } from '@nestjs/common';
import { SlackArchiveError } from 'src/common';

export class TokenParseError extends SlackArchiveError {
  constructor() {
    super('unauthorized', 'Invalid token format', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenError extends SlackArchiveError {
  constructor() {
    super('unauthorized', 'Invalid token', HttpStatus.UNAUTHORIZED);
  }
}

export class MissingTokenError extends SlackArchiveError {
  constructor() {
    super(
      'unauthorized',
      'Missing "loginToken" cookie',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ExpiredTokenError extends SlackArchiveError {
  constructor() {
    super('token_expired', 'Login token expired', HttpStatus.UNAUTHORIZED);
  }
}
