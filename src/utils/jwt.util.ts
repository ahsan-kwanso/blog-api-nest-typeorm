import * as jwt from 'jsonwebtoken';
import { TokenPayload } from 'src/types/tokenPayload.interface';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const EXPIRATION_TIME = '4h'; // 1 hour

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET_KEY);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, SECRET_KEY) as TokenPayload;
};
