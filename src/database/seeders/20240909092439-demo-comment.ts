import { createConnection, getRepository } from 'typeorm';
import { Comment } from 'sequelize-typescript';

const seedComments = async () => {
  const connection = await createConnection();
  const commentRepository = getRepository(Comment);

  // Seed data
  const comments = [
    {
      UserId: 1,
      PostId: 1,
      ParentCommentId: null,
      content: 'Comment on the first post.',
    },
    {
      UserId: 1,
      PostId: 2,
      ParentCommentId: null,
      content: 'Comment on the second post.',
    },
  ];

  // Insert comments
  await commentRepository.save(comments);

  console.log('Comments seeded');
  await connection.close();
};

// Run the seed function
seedComments().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
