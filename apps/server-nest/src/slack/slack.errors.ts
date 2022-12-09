import { HttpStatus } from '@nestjs/common';
import { SlackArchiveError } from 'src/common';

export class SlackApiError extends SlackArchiveError {
  constructor(slackErrorCode: string) {
    super(
      'slack_error',
      `Received error from Slack: ${slackErrorCode}`,
      HttpStatus.BAD_GATEWAY,
    );
  }
}
