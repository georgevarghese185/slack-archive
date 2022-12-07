import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MissingTokenError } from './token/token.errors';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const loginToken = this.extractLoginToken(request);
    const tokenPayload = await this.authService.verifyToken(loginToken);

    request.tokenPayload = tokenPayload;

    return true;
  }

  private isPublicRoute(context: ExecutionContext) {
    return this.reflector.get<boolean | undefined>(
      'isPublic',
      context.getHandler(),
    );
  }

  private extractLoginToken(request: Request) {
    const loginToken = request.cookies.loginToken;

    if (!loginToken) {
      throw new MissingTokenError();
    }

    return loginToken;
  }
}
