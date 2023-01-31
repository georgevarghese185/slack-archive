import {
  ConversationsRequest,
  ConversationsResponse,
  ExchangeCodeRequest,
  ExchangeCodeResponse,
  RevokeAuthRequest,
  SlackApiResponse,
  TestAuthRequest,
  MembersRequest,
  MembersResponse,
} from './slack.types';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigService } from 'src/config/config.service';
import { stringify } from 'querystring';
import { SlackArchiveError } from 'src/common';
import { withRateLimiting } from 'src/common/axios/with-rate-limiting';
import { ConversationHistoryRequest, ConversationHistoryResponse } from '.';

@Injectable()
export class SlackApiProvider {
  constructor(private config: ConfigService) {}

  public static readonly API_EXCHANGE_CODE = '/api/oauth.access';

  async exchangeCode(
    request: ExchangeCodeRequest,
  ): Promise<SlackApiResponse<ExchangeCodeResponse>> {
    return this.request({
      method: 'POST',
      url: SlackApiProvider.API_EXCHANGE_CODE,
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

  public static readonly API_TEST_AUTH = '/api/auth.test';

  async testAuth(request: TestAuthRequest): Promise<SlackApiResponse> {
    return this.request({
      method: 'POST',
      url: SlackApiProvider.API_TEST_AUTH,
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

  public static readonly API_GET_CONVERSATIONS = '/api/conversations.list';

  async getConversations(
    request: ConversationsRequest,
  ): Promise<SlackApiResponse<ConversationsResponse>> {
    const params: Record<string, string> = {};

    if (request.cursor) {
      params['cursor'] = request.cursor;
    }

    if (this.config.experiments.backupPrivateMessages) {
      // for experimental use. Not officially supported yet
      params['types'] = 'public_channel,private_channel,mpim,im';
    }

    return this.request({
      method: 'GET',
      url: SlackApiProvider.API_GET_CONVERSATIONS,
      headers: {
        authorization: `Bearer ${request.token}`,
      },
      params,
    });
  }

  public static readonly API_GET_MEMBERS = '/api/users.list';

  async getMembers(
    request: MembersRequest,
  ): Promise<SlackApiResponse<MembersResponse>> {
    const params: Record<string, string> = {};

    if (request.cursor) {
      params['cursor'] = request.cursor;
    }

    return this.request({
      method: 'GET',
      url: SlackApiProvider.API_GET_MEMBERS,
      headers: {
        authorization: `Bearer ${request.token}`,
      },
      params,
    });
  }

  async getConversationHistory(
    _request: ConversationHistoryRequest,
  ): Promise<SlackApiResponse<ConversationHistoryResponse>> {
    throw new Error('Not implemented');
  }

  private async request<R>(
    config: AxiosRequestConfig,
  ): Promise<SlackApiResponse<R>> {
    try {
      const axiosInstance = axios.create({
        baseURL: this.config.slack.baseUrl,
      });

      withRateLimiting(axiosInstance);

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
