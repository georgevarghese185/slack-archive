import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ServerConfig } from '.';
import { defaultPort, defaultSlackBaseUrl } from './config.defaults';
import { ExperimentsConfig, SlackConfig } from './config.types';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get server(): ServerConfig {
    return {
      port: +(this.nestConfigService.get<string>('PORT') || defaultPort),
    };
  }

  get experiments(): ExperimentsConfig {
    return {
      backupPrivateMessages:
        this.nestConfigService.get<string>('EXP_PRIVATE_SCOPE') === 'true',
    };
  }

  get slack(): SlackConfig {
    return {
      baseUrl:
        this.nestConfigService.get<string>('SLACK_BASE_URL') ||
        defaultSlackBaseUrl,
      clientId: this.nestConfigService.getOrThrow<string>('SLACK_CLIENT_ID'),
      teamId: this.nestConfigService.getOrThrow<string>('SLACK_TEAM_ID'),
      oauthRedirectUri:
        this.nestConfigService.getOrThrow<string>('OAUTH_REDIRECT_URI'),
    };
  }
}
