import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user.entity'; // Updated import path
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { generateToken } from 'src/utils/jwt.util';
import * as sgMail from '@sendgrid/mail';
import { EmailService } from 'src/thirdParty/sg/email.service';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async signup(signupDto: SignupDto): Promise<string> {
    const verificationCode = crypto.randomBytes(3).toString('hex'); // Generate a 6-character code

    const existingUser = await this.userRepository.findOneBy({
      email: signupDto.email,
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const user = this.userRepository.create({
      ...signupDto,
      isVerified: false, // User is not verified yet
      verificationCode: verificationCode, // Store the verification code
    });
    // Send the verification code to the user's email
    await this.emailService.sendVerificationEmail(
      signupDto.email,
      verificationCode,
    );
    await this.userRepository.save(user);

    // Return a message to the user indicating that they need to verify their email
    return 'A verification code has been sent to your email. Please verify your account.';
  }

  async verifyEmail(email: string, code: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('Already Verified');
    }
    if (user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = ''; // Clear the verification code after success
      await this.userRepository.save(user);
      return user;
    } else {
      throw new BadRequestException(
        'The verification code you entered is incorrect. Please try again.',
      ); // Code mismatch
    }
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
        'verificationCode',
      ], // Manually select password
    });

    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user && !user.isVerified) {
      const verificationCode: string = user.verificationCode;
      console.log(verificationCode);
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
      );

      throw new UnauthorizedException(
        'Email not verified. A verification code has been sent to your email.',
      );
    }

    return generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
}
