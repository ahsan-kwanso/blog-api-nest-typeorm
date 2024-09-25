import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<{ message: string }> {
    const message = await this.authService.signup(signupDto);
    return { message: message };
  }

  @Post('signin')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    await this.authService.login(loginDto, res);
    // no need to send token as it is stored in cookie
    res.send({ message: 'Login successful' });
  }

  @Post('verify-email')
  async verifyEmail(
    @Body('token') token: string,
  ): Promise<{ message: string }> {
    const user = await this.authService.verifyEmail(token);
    if (user) {
      return { message: 'Email successfully verified!' };
    } else {
      return { message: 'Invalid verification code' };
    }
  }
}
