import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Logger } from 'src/common/logger/logger';

export const createTestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(Logger)
    .useValue({ error: jest.fn() })
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
};
