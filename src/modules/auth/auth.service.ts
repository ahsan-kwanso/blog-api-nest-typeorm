import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user.entity'; // Updated import path
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { generateToken } from 'src/utils/jwt.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signup(signupDto: SignupDto): Promise<string> {
    const existingUser = await this.userRepository.findOneBy({
      email: signupDto.email,
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const user = this.userRepository.create(signupDto);
    await this.userRepository.save(user);
    return generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'name', 'email', 'password', 'role'], // Manually select password
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
