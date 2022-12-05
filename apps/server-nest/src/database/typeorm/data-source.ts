import { ConfigService as NestConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { envFilePaths } from '../../config';
import { ConfigService } from '../../config/config.service';
import { getTypeOrmConfig } from './typeorm.config';
import { resolve } from 'path';

// load any variables present in .env files
envFilePaths.forEach((path) => dotenvConfig({ path }));

const config = new ConfigService(new NestConfigService());
const srcPath = resolve(__dirname, '../../');
const typeOrmConfig = getTypeOrmConfig(config, srcPath);
const dataSource = new DataSource(typeOrmConfig);

export default dataSource;
