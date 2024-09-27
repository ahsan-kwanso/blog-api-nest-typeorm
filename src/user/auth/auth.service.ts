import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity'; // Updated import path
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as sgMail from '@sendgrid/mail';
import { EmailService } from 'src/integrations/sg/email.service';
import { PasswordHelper } from './password.helper';
import { Role as RoleEnum } from '../dto/role.enum'; // Import Role enum
import { Response, Request as ExpressRequest } from 'express';
import { JwtService } from '../../utils/jwt.service';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly passwordHelper: PasswordHelper,
    private readonly configService: ConfigService, // Inject ConfigService
    private readonly jwtService: JwtService,
  ) {
    // Use ConfigService to get the SendGrid API key
    sgMail.setApiKey(
      this.configService.get<string>('SENDGRID_API_KEY') || 'your Key',
    ); // Use ConfigService
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
    const verificationLink = `${this.configService.get('APP_URL')}/verify-email?token=${verificationToken}`;
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

  async login(loginDto: LoginDto, res: Response): Promise<void> {
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
      const verificationLink = `${this.configService.get('APP_URL')}/verify-email?token=${verificationToken}`;
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationLink,
      );

      throw new UnauthorizedException(
        'Email not verified. A verification link has been sent to your email.',
      );
    }
    const role: RoleEnum = user.role.name as RoleEnum; // Cast as Role enum
    const token = this.jwtService.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
    });

    // Set the token as a cookie in the response
    res.cookie('auth_token', token, {
      httpOnly: true, // Prevent access to the cookie from client-side JavaScript
      secure: false, // Set to true in production (HTTPS)
      maxAge: 86400000, // 1 day
      sameSite: 'strict', // Protect against CSRF attacks
    });
  }

  validateToken(req: ExpressRequest) {
    const token = req.cookies['auth_token']; // Get the token from the cookie

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verifyToken(token); // Verify the token
      return decoded; // Return the decoded token if valid
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
