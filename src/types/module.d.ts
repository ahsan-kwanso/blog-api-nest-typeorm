import { TokenPayload } from '../user/auth/dto/tokenPayload.interface';

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
      cookies: {
        [key: string]: string;
      };
    }
  }
}
