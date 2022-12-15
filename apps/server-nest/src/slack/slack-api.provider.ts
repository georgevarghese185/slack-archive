import {
  ConversationsRequest,
  ConversationsResponse,
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
import { SlackArchiveError } from 'src/common';

@Injectable()
export class SlackApiProvider {
  constructor(private config: ConfigService) {}

  async exchangeCode(
    request: ExchangeCodeRequest,
  ): Promise<SlackApiResponse<ExchangeCodeResponse>> {
    return this.request({
      method: 'POST',
      url: '/api/oauth.access',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: this.config.slack.clientId,
        password: this.config.slack.clientSecret,
      },
      data: stringify(request),
    });
  }

  async testAuth(request: TestAuthRequest): Promise<SlackApiResponse> {
    return this.request({
      method: 'POST',
      url: '/api/auth.test',
      headers: {
        authorization: `Bearer ${request.token}`,
      },
    });
  }

  async revokeAuth(request: RevokeAuthRequest): Promise<SlackApiResponse> {
    return this.request({
      method: 'POST',
      url: '/api/auth.revoke',
      headers: {
        authorization: `Bearer ${request.token}`,
      },
    });
  }

  async getConversations(
    _request: ConversationsRequest = {},
  ): Promise<SlackApiResponse<ConversationsResponse>> {
    throw new Error('Not Implemented');

    // TODO: handle rate limiting
  }

  private async request<R>(
    config: AxiosRequestConfig,
  ): Promise<SlackApiResponse<R>> {
    try {
      const axiosInstance = axios.create({
        baseURL: this.config.slack.baseUrl,
      });

      const response = await axiosInstance(config);

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
