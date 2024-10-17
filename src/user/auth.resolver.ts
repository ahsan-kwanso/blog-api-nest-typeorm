import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Public } from 'src/common/public.decorator';
import { SetAuthTokenInterceptor } from 'src/common/set-auth-token.interceptor';
import { UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express'; // Import Response for typing
import { LoginResponse } from './dto/login-response.dto';
import { Message } from '../common/message.dto';

interface GraphQLResponseContext {
  res: Response;
}
interface GraphQLRequestContext {
  req: Request;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: UserService) {}

  @Public() // This decorator can be adjusted or removed later
  @Mutation(() => Message) // Assuming signup returns a string message
  async signup(@Args('signupDto') signupDto: SignupDto): Promise<Message> {
    const message = await this.authService.signup(signupDto);
    return { message: message };
  }

  @Public() // This decorator can be adjusted or removed later
  @Mutation(() => LoginResponse) // Assuming login returns a string message
  @UseInterceptors(SetAuthTokenInterceptor) // Apply the interceptor for cookie setting
  async login(@Args('loginDto') loginDto: LoginDto): Promise<LoginResponse> {
    const token = await this.authService.login(loginDto);
    return { message: 'Login successful' }; // Return token for interceptor to process
  }

  @Public() // This decorator can be adjusted or removed later
  @Mutation(() => Message) // Assuming verifyEmail returns a string message
  async verifyEmail(@Args('token') token: string): Promise<Message> {
    const user = await this.authService.verifyEmail(token);
    if (user) {
      return { message: 'Email successfully verified!' };
    } else {
      throw new Error('Invalid verification code'); // Handle this as an error
    }
  }

  @Mutation(() => Message) // Signout typically doesn't return a payload, just a message
  async signout(@Context() context: GraphQLResponseContext): Promise<Message> {
    const response: Response = context.res; // Access the response object from the context
    response.clearCookie('auth_token'); // Clear the cookie on sign out
    return { message: 'Successfully signed out' };
  }

  @Query(() => Message) // Assuming protected route check returns a string message
  async checkAuth(@Context() context: GraphQLRequestContext): Promise<Message> {
    const request: Request = context.req; // Access the request object from the context
    try {
      const user = this.authService.validateToken(request); // Validate the token
      return { message: 'Access granted' }; // Send back user info
    } catch (error) {
      throw new Error(error.message); // Throw error to be caught by GraphQL
    }
  }
}
