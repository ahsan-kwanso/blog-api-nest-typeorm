import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { Role } from './role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginatedUserWithNumberOfPosts,
  UserWithNumberOfPosts,
} from 'src/user/dto/user';
import paginationConfig from 'src/utils/pagination.config';
import { Request as ExpressRequest } from 'express';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { Repository } from 'typeorm';
import { FileUploadService } from 'src/thirdParty/s3/file-upload.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly urlGeneratorService: UrlGeneratorService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(createUserDto: Partial<CreateUserDto>): Promise<User> {
    // Check if a user with the same email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // If user exists, throw ConflictException
      throw new ConflictException('A user with this email already exists');
    }

    const { roleId } = createUserDto;

    let role: Role | null;

    // Check if roleId is provided
    if (roleId) {
      role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    } else {
      // If no role specified, assign 'user' role by default
      role = await this.roleRepository.findOne({ where: { name: 'user' } });
      if (!role) {
        throw new NotFoundException('Default user role not found');
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      role,
    });

    // Save the new user to the database
    await this.userRepository.save(user);

    const reloadedUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    if (!reloadedUser) {
      throw new NotFoundException('User not found');
    }

    return reloadedUser;
  }

  //this is being used by controller so I will send number of posts embedded in here
  async findAll(): Promise<UserWithNumberOfPosts[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post') // Join with posts
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'COUNT(post.id) AS posts', // Count the number of posts
      ])
      .groupBy('user.id') // Group by user to aggregate post counts
      .getRawMany(); // Get raw results

    // Map the result to match the UserWithNumberOfPosts interface
    return users.map((user) => ({
      id: user.user_id,
      name: user.user_name,
      email: user.user_email,
      role: user.user_role,
      posts: Number(user.posts), // Cast the posts count to a number
    }));
  }

  async findAllPaginated(
    req: ExpressRequest,
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    role?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedUserWithNumberOfPosts> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    // Construct order clause based on sortBy and sortOrder
    const order: { [key: string]: 'ASC' | 'DESC' } = {};
    if (sortBy) {
      const sortField = sortBy === 'posts' ? 'postscount' : 'user.name';
      order[sortField] = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'ASC';
    }

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
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
      .offset((pageNumber - 1) * pageSize) // Offset for pagination
      .limit(pageSize); // Limit the results

    if (role) {
      queryBuilder.andWhere('role.name = :role', { role }); // Corrected to access role name
    }

    if (Object.keys(order).length) {
      queryBuilder.orderBy(order);
    }

    // Fetch paginated users and total count
    const [users, countResult] = await Promise.all([
      queryBuilder.getRawMany(), // Get raw results
      this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.posts', 'post')
        .leftJoin('user.role', 'role') // Join with role for total count query
        .select('COUNT(user.id)', 'count')
        .where(role ? 'role.name = :role' : '1=1', { role })
        .getRawOne(), // Get total count
    ]);

    const totalCount = parseInt(countResult?.count || '0', 10);

    // Map raw results to UserWithNumberOfPosts interface
    const userWithNumberOfPosts = users.map((user) => ({
      id: user.user_id,
      name: user.user_name,
      email: user.user_email,
      role: user.user_role,
      posts: Number(user.postscount), // Cast posts count to a number
    }));

    const totalPages = Math.ceil(totalCount / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      users: userWithNumberOfPosts,
      total: totalCount,
      page: pageNumber,
      pageSize: pageSize,
      nextPage: this.urlGeneratorService.generateNextPageUrl(
        nextPage,
        pageSize,
        req,
      ),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    adminId: number,
  ): Promise<User> {
    if (id === adminId) {
      throw new ForbiddenException("You can't modify your own records.");
    }

    // Find the user by ID
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user properties with the DTO values
    Object.assign(user, updateUserDto);

    // Save the updated user
    await this.userRepository.save(user);

    return user;
  }

  async remove(id: number): Promise<void> {
    // Find the user by ID
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove the user
    await this.userRepository.remove(user);
  }

  // get logged in user
  async getCurrentUser(id: number): Promise<User> {
    return await this.findOne(id);
  }

  async uploadProfilePicture(
    userId: number,
    file: Express.Multer.File,
    loggedInUserId: number,
  ): Promise<User> {
    if (userId !== loggedInUserId) {
      throw new ForbiddenException('You are not authenticated.');
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // Use FileUploadService to upload file and get the file key
      const fileKey = await this.fileUploadService.uploadFile(file);

      // Get signed URL
      const signedUrl = await this.fileUploadService.getSignedUrlS(fileKey);

      user.profilePictureUrl = signedUrl;
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error uploading profile picture');
    }
  }
}
