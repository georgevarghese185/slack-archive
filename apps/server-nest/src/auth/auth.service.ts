import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { SCOPE_PRIVATE_MESSAGES, SCOPE_PUBLIC_MESSAGES } from 'src/slack';
import { AuthUrl } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private config: ConfigService) {}

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
}
