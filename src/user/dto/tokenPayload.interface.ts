import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from './role.enum';

@ObjectType() // Specify this class as a GraphQL ObjectType
export class TokenPayload {
  @Field() // Define this field for GraphQL
  id: number;

  @Field() // Define this field for GraphQL
  name: string;

  @Field() // Define this field for GraphQL
  email: string;

  @Field(() => Role) // Define this field for GraphQL with type
  role: Role;
}
