import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  dropSchema: false,
  logging: false,
  logger: 'file',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscriber/**/*.ts'],
  migrationsTableName: 'migration_table',
});
