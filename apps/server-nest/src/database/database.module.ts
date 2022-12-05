import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { getTypeOrmConfig } from './typeorm/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const srcPath = resolve(__dirname, '../');
        return getTypeOrmConfig(configService, srcPath);
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
