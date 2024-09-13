import { createConnection, getConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { Role } from 'src/types/role.enum';

const seed = async () => {
  const connection = await createConnection();
  const userRepository = connection.getRepository(User);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  // Create a new user instance
  const user = new User();
  user.name = 'John';
  user.email = 'john@example.com';
  user.password = hashedPassword;
  user.role = Role.USER; // Ensure the Role enum or value is correctly assigned

  // Save the user
  await userRepository.save(user);

  console.log('User seeded');
  await connection.close();
};

// Run the seed function
seed().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
