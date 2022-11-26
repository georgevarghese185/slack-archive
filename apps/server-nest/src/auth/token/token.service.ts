import type { TokenPayload } from '../auth.types';
import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import {
  JwtPayload,
  sign,
  TokenExpiredError as JwtTokenExpiredError,
  verify,
} from 'jsonwebtoken';
import { ConfigService } from 'src/config/config.service';
import {
  ExpiredTokenError,
  InvalidTokenError,
  TokenParseError,
} from './token.errors';

/**
 * This class does a slow scrypt key derivation on instantiation so don't scope it by request. It should be instantiated
 * only once on startup
 */
@Injectable()
export class TokenService {
  private algorithm = 'aes-256-gcm' as const;
  private keySize = 32;
  private key: Buffer;
  private expiresIn;

  constructor(private config: ConfigService) {
    this.key = scryptSync(
      config.tokenSecret,
      config.tokenSecret, // since the token secret is assumed to be a strong random string and kept secret, the salt doesn't really matter so we're using the token itself as a salt
      this.keySize,
    );

    this.expiresIn = config.tokenExpiry;
  }

  async sign(payload: TokenPayload): Promise<string> {
    const iv = randomBytes(this.keySize);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const token = this.jwtSign(payload);

    const encryptedToken =
      cipher.update(token, 'utf-8', 'base64') + cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return [
      encryptedToken,
      iv.toString('base64'),
      authTag.toString('base64'),
    ].join('_');
  }

  async verify(
    token: string,
    ignoreExpired = false,
  ): Promise<TokenPayload & JwtPayload> {
    const decryptedToken = await this.decryptToken(token);
    const decodedToken = this.jwtVerify(decryptedToken, ignoreExpired);

    if (typeof decodedToken === 'string') {
      throw new InvalidTokenError();
    }

    return decodedToken as TokenPayload & JwtPayload;
  }

  private async decryptToken(token: string) {
    const [encryptedToken, iv, authTag] = token.split('_');

    if (!encryptedToken || !iv || !authTag) {
      throw new TokenParseError();
    }

    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    const decryptedToken =
      decipher.update(encryptedToken, 'base64', 'utf-8') +
      decipher.final('utf-8');

    return decryptedToken;
  }

  private jwtSign(payload: object) {
    return sign(payload, this.config.tokenSecret, {
      expiresIn: this.expiresIn,
    });
  }

  private jwtVerify(token: string, ignoreExpired: boolean) {
    try {
      return verify(token, this.config.tokenSecret, {
        ignoreExpiration: ignoreExpired,
      });
    } catch (e) {
      if (e instanceof JwtTokenExpiredError) {
        throw new ExpiredTokenError();
      }

      throw new InvalidTokenError();
    }
  }
}
