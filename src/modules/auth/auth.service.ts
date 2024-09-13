import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
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
dotenv.config();

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Configure Nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports (587 for Gmail)
      auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your email password
      },
    });
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
    await this.userRepository.save(user);
    // Send the verification code to the user's email
    await this.sendVerificationEmail(user.email, verificationCode);

    // Return a message to the user indicating that they need to verify their email
    return 'A verification code has been sent to your email. Please verify your account.';

    // return generateToken({
    //   id: user.id,
    //   name: user.name,
    //   email: user.email,
    //   role: user.role,
    // });
  }

  private async sendVerificationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    // Email message content
    const mailOptions = {
      from: process.env.SMTP_USER, // Sender address
      to: email, // Recipient's email address
      subject: 'Verify Your Email Address', // Subject line
      text: `Please use the following verification code to verify your email: ${code}`,
      html: `<p>Thank you for registering! Use the following code to verify your email:</p><h2>${code}</h2>`,
    };

    // Send email
    try {
      await this.transporter.sendMail(mailOptions);
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
      return null; // Code mismatch
    }
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'name', 'email', 'password', 'role', 'isVerified'], // Manually select password
    });
    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // if (!user.isVerified) {
    //   const verificationCode = crypto.randomBytes(3).toString('hex'); // Generate a new verification code

    //   // Update the user's verification code in the database
    //   user.verificationCode = verificationCode;
    //   await this.userRepository.save(user);

    //   // Resend the verification email
    //   await this.sendVerificationEmail(user.email, verificationCode);

    //   throw new UnauthorizedException(
    //     'Your email is not verified. A new verification code has been sent to your email.',
    //   );
    // }

    // uncomment on monday and test

    return generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
}
