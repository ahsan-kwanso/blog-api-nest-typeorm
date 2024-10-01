import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from 'src/user/dto/tokenPayload.interface';

@Injectable()
export class JwtService {
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get('JWT_SECRET') || 'your-secret-key';
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: '24h' });
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.secretKey) as TokenPayload;
  }
}
