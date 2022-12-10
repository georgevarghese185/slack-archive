import { NestFactory } from '@nestjs/core';
import { applyMiddleware, AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyMiddleware(app);
  const config = app.get<ConfigService>(ConfigService);
  await app.listen(config.server.port);
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
