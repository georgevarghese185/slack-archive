import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/v1/login')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('auth-url')
  getAuthUrl() {
    return this.authService.getAuthUrl();
  }
}
