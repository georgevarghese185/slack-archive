import { config } from 'dotenv';

export default function () {
  process.env.ENV = 'prod';
  config({ path: '.env' });
  config({ path: '.env.local' });
}
