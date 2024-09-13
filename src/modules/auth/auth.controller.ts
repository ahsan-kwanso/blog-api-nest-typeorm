import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<{ token: string }> {
    const token = await this.authService.signup(signupDto);
    return { token: token };
  }

  @Post('signin')
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    const token = await this.authService.login(loginDto);
    return { token: token };
  }

  @Post('verify-email')
  async verifyEmail(
    @Body('email') email: string,
    @Body('code') code: string,
  ): Promise<string> {
    const user = await this.authService.verifyEmail(email, code);
    if (user) {
      return 'Email successfully verified!';
    } else {
      return 'Invalid verification code';
    }
  }
}
