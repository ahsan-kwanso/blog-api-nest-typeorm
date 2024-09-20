import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost', // Default host
  port: +process.env.DB_PORT! || 5432, // Default PostgreSQL port
  username: process.env.DB_USERNAME || 'default_user', // Default username
  password: process.env.DB_PASSWORD || 'default_password', // Default password
  database: process.env.DB_NAME || 'default_db', // Default database name
  synchronize: false,
  dropSchema: false,
  logging: false,
  logger: 'file',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscriber/**/*.ts'],
  migrationsTableName: 'migration_table',
});
