import { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { ConfigService } from 'src/config/config.service';
import { Token, Public } from './decorator';

@Controller('/v1/login')
export class AuthController {
  private cookieOptions = {
    httpOnly: true,
    secure: !this.config.isDev,
  };

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

    res.cookie('loginToken', token, this.cookieOptions);

    return {};
  }

  @Get('status')
  async getLoginStatus(@Token() token: string) {
    await this.authService.validateToken(token);
  }

  @Delete()
  async logout(
    @Token() token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(token);
    res.cookie('loginToken', '', this.cookieOptions);
  }
}
