import { createConnection, getRepository } from 'typeorm';
import { Post } from '@nestjs/common';

const seedPosts = async () => {
  const connection = await createConnection();
  const postRepository = getRepository(Post);

  // Seed data
  const posts = [
    {
      UserId: 1,
      title: 'First Post',
      content: 'Content of the first post.',
    },
    {
      UserId: 1,
      title: 'Second Post',
      content: 'Content of the second post.',
    },
  ];

  // Insert posts
  await postRepository.save(posts);

  console.log('Posts seeded');
  await connection.close();
};

// Run the seed function
seedPosts().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
