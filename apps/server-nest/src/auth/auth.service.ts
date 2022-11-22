import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { SCOPE_PRIVATE_MESSAGES, SCOPE_PUBLIC_MESSAGES } from 'src/slack';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { AuthUrl, LoginToken } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private slackProvider: SlackApiProvider,
    private tokenService: TokenService,
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

  async login({ verificationCode }: LoginDto): Promise<LoginToken> {
    const response = await this.slackProvider.request('/api/oauth.access', {
      code: verificationCode,
      redirect_uri: this.config.slack.oauthRedirectUri,
    });

    if (!response.ok) {
      throw new Error('Not Implemented');
    }

    const { access_token, user_id } = response;
    const token = await this.tokenService.sign({
      accessToken: access_token,
      userId: user_id,
    });

    return { token };
  }
}
