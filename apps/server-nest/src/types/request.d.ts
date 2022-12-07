import { TokenPayload } from 'src/auth';

declare global {
  namespace Express {
    interface Request {
      tokenPayload: TokenPayload;
    }
  }
}
