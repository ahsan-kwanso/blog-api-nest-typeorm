import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserSubscriber } from 'src/user/user.subscriber';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<number>('DB_PORT');
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbName = configService.get<string>('DB_NAME');
        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: false, //as I have made tables so I am setting this again to false
          autoLoadEntities: true,
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
          factories: [__dirname + '/factories/**/*{.ts,.js}'],
          cli: {
            migrationsDir: __dirname + '/migrations/',
          },
          logging: true,
          subscribers: [UserSubscriber], // Add the subscriber(s) here
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
