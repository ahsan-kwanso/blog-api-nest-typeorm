import * as bcrypt from 'bcrypt';

export class PasswordHelper {
  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
