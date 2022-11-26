import type { SlackArchiveError } from 'src/common/error';
import type { AuthUrl, LoginToken } from './auth.types';
import { Injectable } from '@nestjs/common';
import { Logger } from 'src/common/logger/logger';
import { ConfigService } from 'src/config/config.service';
import { SCOPE_PRIVATE_MESSAGES, SCOPE_PUBLIC_MESSAGES } from 'src/slack';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { SlackApiError } from 'src/slack/slack.errors';
import {
  InvalidVerificationCodeError,
  SpentVerificationCodeError,
} from './auth.errors';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private slackProvider: SlackApiProvider,
    private tokenService: TokenService,
    private logger: Logger,
  ) {}

  getAuthUrl(): AuthUrl {
    return {
      url: `${this.config.slack.baseUrl}/oauth/authorize`,
      parameters: {
        client_id: this.config.slack.clientId,
        team: this.config.slack.teamId,
        scope: this.config.experiments.backupPrivateMessages
          ? SCOPE_PRIVATE_MESSAGES // for experimental use. Not officially supported yet
          : SCOPE_PUBLIC_MESSAGES,
        redirect_uri: this.config.slack.oauthRedirectUri,
      },
    };
  }

  async login(verificationCode: string): Promise<LoginToken> {
    const response = await this.slackProvider.exchangeCode({
      code: verificationCode,
      redirect_uri: this.config.slack.oauthRedirectUri,
    });

    if (response.ok === false) {
      throw this.getLoginError(response.error);
    }

    const { access_token, user_id } = response;
    const token = await this.tokenService.sign({
      accessToken: access_token,
      userId: user_id,
    });

    return { token };
  }

  private getLoginError(slackErrorCode: string): SlackArchiveError {
    if (slackErrorCode === 'invalid_code') {
      return new InvalidVerificationCodeError();
    }

    if (slackErrorCode === 'code_already_used') {
      return new SpentVerificationCodeError();
    }

    this.logger.error(
      `Error trying to exchange verification code with Slack: ${slackErrorCode}`,
    );

    return new SlackApiError(slackErrorCode);
  }
}
