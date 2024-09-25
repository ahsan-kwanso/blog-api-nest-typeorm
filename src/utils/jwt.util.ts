// import * as jwt from 'jsonwebtoken';
// import { TokenPayload } from 'src/user/auth/dto/tokenPayload.interface';

// const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// export const generateToken = (payload: TokenPayload): string => {
//   return jwt.sign(payload, SECRET_KEY, { expiresIn: '48h' });
// };

// export const verifyToken = (token: string): TokenPayload => {
//   return jwt.verify(token, SECRET_KEY) as TokenPayload;
// };

// as now shifted to class based
