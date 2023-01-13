import { HttpStatus } from '@nestjs/common';
import { SlackArchiveError } from 'src/common';

export class SlackApiError extends SlackArchiveError {
  constructor(slackErrorCode: string, api: string) {
    super(
      'slack_error',
      `Received error from Slack API ${api}: ${slackErrorCode}`,
      HttpStatus.BAD_GATEWAY,
    );
  }
}
