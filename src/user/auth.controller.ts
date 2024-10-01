import { Body, Controller, Post, Res, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Response, Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: UserService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<{ message: string }> {
    const message = await this.authService.signup(signupDto);
    return { message: message };
  }

  @Post('signin')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    await this.authService.login(loginDto, res); //handle it in interceptor
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

  @Get('signout')
  async signout(@Res() res: Response): Promise<void> {
    res.clearCookie('auth_token'); // Clear the cookie on sign out
    res.status(200).json({ message: 'Successfully signed out' });
  }

  @Get('protected-route')
  async checkAuth(
    @Req() req: ExpressRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const user = this.authService.validateToken(req); // Validate the token
      res.status(200).json({ message: 'Access granted', user }); // Send back user info
    } catch (error) {
      res.status(401).json({ message: error.message }); // Send unauthorized if token is invalid
    }
  }
}
