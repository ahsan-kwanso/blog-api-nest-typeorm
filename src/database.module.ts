import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: ['src/**/*.entity{.ts,.js}'], // You can manually import and place them here as well
        synchronize: false,
        autoLoadEntities: true,
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        seeds: [__dirname + '/database/seeds/**/*{.ts,.js}'],
        factories: [__dirname + '/database/factories/**/*{.ts,.js}'],
        cli: {
          migrationsDir: __dirname + '/database/migrations/',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class DatabaseModule {}
