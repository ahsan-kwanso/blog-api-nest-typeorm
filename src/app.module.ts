import {
  Module,
  ValidationPipe,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AuthModule } from './user/auth/auth.module';
import { AuthMiddleware } from './common/auth.middleware';
import { RolesGuard } from './common/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { ConditionalPostAuthMiddleware } from './common/cond.auth.middleware';
import { JwtModule } from './utils/jwt.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path'; // Needed for schema file path
import { AppResolver } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // validation for config
    DatabaseModule, // Add DatabaseModule here
    UserModule,
    PostModule,
    CommentModule,
    AuthModule,
    JwtModule,
    // Adding GraphQL Module
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Automatically generates schema.gql
      sortSchema: true, // Sorts the schema output
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppResolver,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'auth', method: RequestMethod.POST }, 'auth/(.*)') // Exclude auth routes from middleware
      .exclude({ path: 'posts', method: RequestMethod.GET }, 'posts/search') // The authentication is added through guard and we have removed authentication from get methods, but using guard will apply authentication based on the filter query param
      .forRoutes('*'); // Apply to all routes

    consumer
      .apply(ConditionalPostAuthMiddleware) // Specific middleware for GET /posts
      .forRoutes({ path: 'posts', method: RequestMethod.GET }, 'posts/search');
  }
}
