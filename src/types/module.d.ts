import { TokenPayload } from './tokenPayload.interface';

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}
