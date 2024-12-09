import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';

@InputType() // Specify that this class is an input type for GraphQL
export class LoginDto {
  @Field() // Define this field for GraphQL
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Field() // Define this field for GraphQL
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
