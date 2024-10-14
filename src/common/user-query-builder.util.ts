// user-query-builder.util.ts
import { SelectQueryBuilder } from 'typeorm';

export class UserQueryBuilderUtil {
  static buildUserWithPostsQuery(
    queryBuilder: SelectQueryBuilder<any>,
    page: number,
    limit: number,
    role?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): SelectQueryBuilder<any> {
    const order: { [key: string]: 'ASC' | 'DESC' } = {};

    if (sortBy) {
      const sortField = sortBy === 'posts' ? 'postscount' : 'user.name';
      order[sortField] = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'ASC';
    }

    queryBuilder
      .leftJoinAndSelect('user.posts', 'post') // Join with posts to count them
      .leftJoin('user.role', 'role') // Join with role to access role properties
      .select([
        'user.id AS user_id',
        'user.name AS user_name',
        'user.email AS user_email',
        'role.name AS user_role', // Accessing role name correctly
        'COUNT(post.id) AS postscount', // Count posts and alias as postscount
      ])
      .groupBy('user.id') // Group by user ID
      .addGroupBy('role.name') // Group by role name
      .offset((page - 1) * limit) // Offset for pagination
      .limit(limit);

    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    if (Object.keys(order).length) {
      queryBuilder.orderBy(order);
    }

    return queryBuilder;
  }
}
