import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from 'src/config/config.service';
import { Token } from './token.decorator';

export const Public = () => SetMetadata('isPublic', true);

@Controller('/v1/login')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Get('auth-url')
  @Public()
  getAuthUrl() {
    return this.authService.getAuthUrl();
  }

  @Post()
  @Public()
  @HttpCode(200)
  async login(
    @Body() { verificationCode }: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(verificationCode);

    res.cookie('loginToken', token, {
      httpOnly: true,
      secure: !this.config.isDev,
    });

    return {};
  }

  @Get('status')
  async getLoginStatus(@Token() token: string) {
    await this.authService.validateToken(token);
  }
}
