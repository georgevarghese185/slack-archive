import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envFilePaths } from './env';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: envFilePaths,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
