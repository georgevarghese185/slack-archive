import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Env, ServerConfig } from '.';
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

  get env() {
    const env = this.nestConfigService.get('ENV') || 'dev';
    const validEnvs = Object.values(Env);

    if (!validEnvs.includes(env)) {
      throw new Error(
        'Value of env variable ENV should be one of: ' + validEnvs.join(', '),
      );
    }

    return env as Env;
  }

  get isDev() {
    return this.env === Env.dev;
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
      clientId: this.getOrThrowrow('SLACK_CLIENT_ID'),
      clientSecret: this.getOrThrowrow('SLACK_CLIENT_SECRET'),
      teamId: this.getOrThrowrow('SLACK_TEAM_ID'),
      oauthRedirectUri: this.getOrThrowrow('OAUTH_REDIRECT_URI'),
    };
  }

  get tokenSecret() {
    return this.getOrThrowrow('TOKEN_SECRET');
  }

  private getOrThrowrow(key: string): string {
    const value = this.nestConfigService.get<string>(key);

    if (value === null || value === undefined) {
      throw new Error(
        `Environment variable ${key} is required but missing. Please provide this variable`,
      );
    }
    return value;
  }
}
