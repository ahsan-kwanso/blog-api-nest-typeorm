import { TokenPayload } from '../user/dto/tokenPayload.interface';

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
