import { Response } from 'express';
import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from 'src/config/config.service';

@Controller('/v1/login')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Get('auth-url')
  getAuthUrl() {
    return this.authService.getAuthUrl();
  }

  @Post()
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
}
