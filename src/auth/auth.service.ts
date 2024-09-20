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
import axios from 'axios';
import * as sgMail from '@sendgrid/mail';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    await this.sendVerificationEmail(signupDto.email, verificationCode);
    await this.userRepository.save(user);

    // Return a message to the user indicating that they need to verify their email
    return 'A verification code has been sent to your email. Please verify your account.';
  }

  private async sendVerificationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    // Email message content
    const msg = {
      to: email, // Recipient's email address
      from: process.env.SENDGRID_SENDER_EMAIL!, // Sender address (must be verified in SendGrid), now verified
      subject: 'Verify Your Email Address', // Subject line
      text: `Please use the following verification code to verify your email: ${code}`,
      html: `<p>Thank you for registering! Use the following code to verify your email:</p><h2>${code}</h2>`,
    };

    // Send email
    try {
      await sgMail.send(msg);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
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
      await this.sendVerificationEmail(user.email, verificationCode);

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
