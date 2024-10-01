import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Response, Request as ExpressRequest } from 'express';
import { Public } from 'src/common/public.decorator';
import { SetAuthTokenInterceptor } from 'src/common/set-auth-token.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: UserService) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<{ message: string }> {
    const message = await this.authService.signup(signupDto);
    return { message: message };
  }

  @Public()
  @Post('signin')
  @UseInterceptors(SetAuthTokenInterceptor) // Apply the interceptor here for cookie setting
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ message: string; token: string }> {
    const token = await this.authService.login(loginDto); // This should return the token
    return { message: 'Login successful', token }; // Return token for interceptor to process
  }

  @Public()
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
