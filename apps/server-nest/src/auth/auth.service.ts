import { SlackArchiveError } from 'src/common';
import { AuthUrl, TokenPayload } from './auth.types';
import { Injectable } from '@nestjs/common';
import { Logger } from 'src/common/logger/logger';
import { ConfigService } from 'src/config/config.service';
import { SCOPE_PRIVATE_MESSAGES, SCOPE_PUBLIC_MESSAGES } from 'src/slack';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { SlackApiError } from 'src/slack';
import {
  InvalidVerificationCodeError,
  SpentVerificationCodeError,
} from './auth.errors';
import { TokenService } from './token/token.service';
import { ExpiredTokenError, InvalidTokenError } from './token';

const invalidTokenSlackErrorCodes = [
  'invalid_auth',
  'account_inactive',
  'token_revoked',
  'no_permission',
  'missing_scope',
];

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

  async login(verificationCode: string): Promise<string> {
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

    return token;
  }

  async logout(token: string) {
    await this.revokeToken(token);
  }

  async validateToken(token: string) {
    const { accessToken } = await this.verifyToken(token);
    const testResponse = await this.slackProvider.testAuth({
      token: accessToken,
    });

    if (!testResponse.ok) {
      if (invalidTokenSlackErrorCodes.includes(testResponse.error)) {
        throw new InvalidTokenError();
      }

      this.logger.error(`Error validating Slack token: ${testResponse.error}`);
      throw new SlackApiError(testResponse.error);
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const { accessToken, userId } = await this.tokenService.verify(token);
      return { accessToken, userId };
    } catch (e) {
      if (e instanceof ExpiredTokenError) {
        void this.revokeToken(token);
      }

      throw e;
    }
  }

  private async revokeToken(token: string) {
    try {
      const { accessToken } = await this.tokenService.verify(token, true);
      await this.slackProvider.revokeAuth({ token: accessToken });
    } catch (e) {
      this.logger.error('Could not revoke token', e);
    }
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
