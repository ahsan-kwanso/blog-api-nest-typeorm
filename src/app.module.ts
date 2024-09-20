import {
  Module,
  ValidationPipe,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './modules/database.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { RolesGuard } from './auth/roles.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // validation for config
    DatabaseModule, // Add DatabaseModule here
    UserModule,
    PostModule,
    CommentModule,
    AuthModule,
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'auth', method: RequestMethod.POST }, 'auth/(.*)') // Exclude auth routes from middleware
      .exclude({ path: 'posts', method: RequestMethod.GET }, 'posts/search') // The authentication is added through guard and we have removed authentication from get methods, but using guard will apply authentication based on the filter query param
      .forRoutes('*'); // Apply to all routes
  }
}
