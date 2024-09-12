import { SequelizeModuleOptions } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize/types';

dotenv.config();

const getSequelizeConfig = (): SequelizeModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    dialect: 'postgres' as Dialect,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    autoLoadModels: true, // Automatically load models
    synchronize: false, // will not synchronize in development mode either, as once I have setup the schema so now no synchronization needed
    //synchronize: !isProduction, // Sync only in non-production environments
    logging: !isProduction, // Enable logging in non-production
  };
};
export default getSequelizeConfig;
