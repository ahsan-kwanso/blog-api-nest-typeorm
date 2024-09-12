import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeModule } from '@nestjs/sequelize';
import getSequelizeConfig from '../config/sequelize.config';
import { User } from '../database/models/user.model';
import { Post } from '../database/models/post.model';
import { Comment } from '../database/models/comment.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => getSequelizeConfig(),
    }),
    SequelizeModule.forFeature([User, Post, Comment]), // Register models
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();
      this.logger.log(
        'Connection to the database has been established successfully.',
      );
    } catch (error) {
      this.logger.error('Unable to connect to the database:', error);
    }
  }
}
