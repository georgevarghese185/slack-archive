import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  ExchangeCodeRequest,
  ExchangeCodeResponse,
  SlackApiResponse,
} from './slack.types';
import axios from 'axios';
import { ConfigService } from 'src/config/config.service';
import { stringify } from 'querystring';
import { SlackArchiveError } from 'src/common/error';

@Injectable()
export class SlackApiProvider {
  constructor(private configService: ConfigService) {}

  async exchangeCode(
    request: ExchangeCodeRequest,
  ): Promise<SlackApiResponse<ExchangeCodeResponse>> {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.configService.slack.baseUrl}/api/oauth.access`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.configService.slack.clientId,
          password: this.configService.slack.clientSecret,
        },
        data: stringify(request),
      });

      return response.data;
    } catch (e) {
      Logger.error(e);

      throw new SlackArchiveError(
        'slack_error',
        'Failed to communicate with slack server',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
