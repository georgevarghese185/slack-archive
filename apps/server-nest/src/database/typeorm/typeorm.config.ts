import { resolve } from 'path';
import { ConfigService } from '../../config/config.service';

export const getTypeOrmConfig = (
  configService: ConfigService,
  srcPath: string,
) => ({
  type: 'postgres' as const,
  url: configService.db.url,
  entities: [resolve(srcPath, '**/*.entity.{ts,js}')],
  migrations: [resolve(srcPath, 'database/typeorm/migrations/*.{ts,js}')],
});
