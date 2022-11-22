import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { ConfigService } from 'src/config/config.service';
import { TokenPayload } from '../auth.types';

/**
 * This class does a slow scrypt key derivation on instantiation so don't scope it by request. It should be instantiated
 * only once on startup
 */
@Injectable()
export class TokenService {
  private algorithm = 'aes-256-gcm' as const;
  private keySize = 32;
  private key: Buffer;
  private expiresIn = '30 days';

  constructor(private configService: ConfigService) {
    this.key = scryptSync(
      configService.tokenSecret,
      configService.tokenSecret, // since the token secret is assumed to be a strong random string and kept secret, the salt doesn't really matter so we're using the token itself as a salt
      this.keySize,
    );
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

  async verify(token: string): Promise<TokenPayload & JwtPayload> {
    const [encryptedToken, iv, authTag] = token.split('_');

    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    const decryptedToken =
      decipher.update(encryptedToken, 'base64', 'utf-8') +
      decipher.final('utf-8');

    const decodedToken = this.jwtVerify(decryptedToken);

    if (typeof decodedToken === 'string') {
      throw new Error('Unexpected JWT string');
    }

    return decodedToken as TokenPayload & JwtPayload;
  }

  private jwtSign(payload: object) {
    return sign(payload, this.configService.tokenSecret, {
      expiresIn: this.expiresIn,
    });
  }

  private jwtVerify(token: string) {
    return verify(token, this.configService.tokenSecret);
  }
}
