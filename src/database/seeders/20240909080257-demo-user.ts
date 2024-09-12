import { QueryInterface, DataTypes } from 'sequelize';
import * as bcrypt from 'bcrypt';

export = {
  up: async (queryInterface: QueryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'John',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Users', {});
  },
};
