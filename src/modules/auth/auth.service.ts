import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/database/models/user.model';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { generateToken } from 'src/utils/jwt.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async signup(signupDto: SignupDto): Promise<string> {
    const existingUser = await this.userModel.findOne({
      where: { email: signupDto.email },
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const user = await this.userModel.create(signupDto as any);
    return generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userModel.scope('withPassword').findOne({
      where: { email: loginDto.email },
    });
    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
}
