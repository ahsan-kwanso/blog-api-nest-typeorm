import { QueryInterface, DataTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export = {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.bulkInsert('Posts', [
      {
        UserId: 1,
        title: 'First Post',
        content: 'Content of the first post.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        UserId: 1,
        title: 'Second Post',
        content: 'Content of the second post.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Posts', {});
  },
};
