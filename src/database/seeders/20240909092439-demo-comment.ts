import { QueryInterface, DataTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export = {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.bulkInsert('Comments', [
      {
        UserId: 1,
        PostId: 1,
        ParentCommentId: null,
        content: 'Comment on the first post.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        UserId: 1,
        PostId: 2,
        ParentCommentId: null,
        content: 'Comment on the second post.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Comments', {});
  },
};
