import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<{ message: string }> {
    const message = await this.authService.signup(signupDto);
    return { message: message };
  }

  @Post('signin')
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    const token = await this.authService.login(loginDto);
    return { token: token };
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
