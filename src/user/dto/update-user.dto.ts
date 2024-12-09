import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Role } from 'src/user/dto/role.enum';

@InputType() // Specify this class as a GraphQL InputType
export class UpdateUserDto {
  @Field({ nullable: true }) // Define this field for GraphQL and make it optional
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true }) // Define this field for GraphQL and make it optional
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true }) // Define this field for GraphQL and make it optional
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @Field({ nullable: true }) // Define this field for GraphQL and make it optional
  @IsOptional()
  RoleId?: number; // You might want to consider adding validation for RoleId if applicable
}
