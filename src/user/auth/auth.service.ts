import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity'; // Updated import path
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { generateToken } from 'src/utils/jwt.util';
import * as sgMail from '@sendgrid/mail';
import { EmailService } from 'src/thirdParty/sg/email.service';
import { PasswordHelper } from './password.helper';
import { Role as RoleEnum } from '../dto/role.enum'; // Import Role enum
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly passwordHelper: PasswordHelper,
  ) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async signup(signupDto: SignupDto): Promise<string> {
    const verificationToken = crypto.randomBytes(32).toString('hex'); // Generate a 6-character code

    const existingUser = await this.userRepository.findOneBy({
      email: signupDto.email,
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const user = this.userRepository.create({
      ...signupDto,
      isVerified: false, // User is not verified yet
      verificationToken, // Store the verification code
      //RoleId: 1, // by default user
    });
    // Send the verification code to the user's email
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    await this.emailService.sendVerificationEmail(
      signupDto.email,
      verificationLink,
    );
    await this.userRepository.save(user);

    // Return a message to the user indicating that they need to verify their email
    return 'A verification link has been sent to your email. Please verify your account.';
  }

  async verifyEmail(token: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token.');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified.');
    }
    if (user.verificationToken === token) {
      user.isVerified = true;
      user.verificationToken = '';
      await this.userRepository.save(user);
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'isVerified',
        'verificationToken',
      ], // Manually select password
      relations: ['role'],
    });

    if (
      !user ||
      !(await this.passwordHelper.validatePassword(
        loginDto.password,
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user && !user.isVerified) {
      const verificationToken = user.verificationToken;
      const verificationLink = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationLink,
      );

      throw new UnauthorizedException(
        'Email not verified. A verification link has been sent to your email.',
      );
    }
    const role: RoleEnum = user.role.name as RoleEnum; // Cast as Role enum
    return generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
    });
  }
}
