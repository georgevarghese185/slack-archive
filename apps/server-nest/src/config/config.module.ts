import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

const envFilePaths = [
  '.env',
  ...(process.env.ENV === 'dev' ? ['.env.local'] : []),
];

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
