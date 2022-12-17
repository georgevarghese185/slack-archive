import { Controller, Get } from '@nestjs/common';
import { Public } from './auth';

@Controller()
export class AppController {
  @Public()
  @Get('/v1/health')
  getHealth(): string {
    return 'up';
  }
}
