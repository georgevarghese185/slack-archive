import { Test, TestingModule } from '@nestjs/testing';
import { applyMiddleware, AppModule } from 'src/app.module';
import { Logger } from '@nestjs/common';

export const createTestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(Logger)
    .useValue({ error: jest.fn() })
    .compile();

  const app = moduleFixture.createNestApplication();
  applyMiddleware(app);
  await app.init();
  return app;
};
