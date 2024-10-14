import {
  Module,
  ValidationPipe,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { LoggingMiddleware } from './common/logging.middleware';
import { AuthGuard } from './common/auth.guard';
import { RolesGuard } from './common/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from './utils/jwt.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path'; // Needed for schema file path
import { AppResolver } from './app.service';
import { Request, Response } from 'express'; // Import Express types
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { RedisModule } from './integrations/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // validation for config
    DatabaseModule, // Add DatabaseModule here
    RedisModule,
    UserModule,
    PostModule,
    CommentModule,
    JwtModule,
    // Adding GraphQL Module
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      introspection: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Automatically generates schema.gql
      sortSchema: true, // Sorts the schema output
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }), // Explicitly type req and res
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Apply AuthGuard globally
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        LoggingMiddleware,
        //graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 1 }), // now rest file upload will not work
        //for graphql upload uncomment above section, for rest upload it is fine, we will be using rest file upload as graphql file upload is not so mature yet
      )
      .forRoutes('*');
  }
}
