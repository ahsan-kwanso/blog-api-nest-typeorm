import { Role } from './role.enum';

export interface TokenPayload {
  id: number;
  name: string;
  email: string;
  role: Role;
}
