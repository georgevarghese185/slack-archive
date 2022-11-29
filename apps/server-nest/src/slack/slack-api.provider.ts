import {
  ExchangeCodeRequest,
  ExchangeCodeResponse,
  RevokeAuthRequest,
  SlackApiResponse,
  TestAuthRequest,
} from './slack.types';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigService } from 'src/config/config.service';
import { stringify } from 'querystring';
import { SlackArchiveError } from 'src/common/error';

@Injectable()
export class SlackApiProvider {
  constructor(private configService: ConfigService) {}

  async exchangeCode(
    request: ExchangeCodeRequest,
  ): Promise<SlackApiResponse<ExchangeCodeResponse>> {
    return this.post({
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
  }

  async testAuth(request: TestAuthRequest): Promise<SlackApiResponse> {
    return this.post({
      method: 'POST',
      url: `${this.configService.slack.baseUrl}/api/auth.test`,
      headers: {
        authorization: `Bearer ${request.token}`,
      },
    });
  }

  async revokeAuth(request: RevokeAuthRequest): Promise<SlackApiResponse> {
    return this.post({
      method: 'POST',
      url: `${this.configService.slack.baseUrl}/api/auth.revoke`,
      headers: {
        authorization: `Bearer ${request.token}`,
      },
    });
  }

  private async post<R>(
    config: AxiosRequestConfig,
  ): Promise<SlackApiResponse<R>> {
    try {
      const response = await axios(config);

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
