import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  imports: [ConfigModule],
  providers: [AuthService],
})
export class AuthModule {}
