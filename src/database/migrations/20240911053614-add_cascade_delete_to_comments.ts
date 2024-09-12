import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    // Modify the PostId foreign key to cascade on delete
    await queryInterface.changeColumn('Comments', 'PostId', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id',
      },
      onDelete: 'CASCADE', // This will cascade delete comments when a post is deleted
    });

    // Modify the ParentCommentId foreign key to cascade on delete
    await queryInterface.changeColumn('Comments', 'ParentCommentId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Comments',
        key: 'id',
      },
      onDelete: 'CASCADE', // This will cascade delete sub-comments when a parent comment is deleted
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Revert the changes
    await queryInterface.changeColumn('Comments', 'PostId', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id',
      },
      onDelete: 'NO ACTION',
    });

    await queryInterface.changeColumn('Comments', 'ParentCommentId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Comments',
        key: 'id',
      },
      onDelete: 'NO ACTION',
    });
  },
};
