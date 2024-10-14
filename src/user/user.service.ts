import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { RoleService } from './role.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedUserWithNumberOfPosts } from 'src/user/dto/user.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Role as RoleEnum } from './dto/role.enum';
import { Request as ExpressRequest } from 'express';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { Repository } from 'typeorm';
import { FileUploadService } from 'src/integrations/s3/file-upload.service';
import { EmailService } from 'src/integrations/sg/email.service';
import { PasswordHelper } from './password.helper';
import { JwtService } from 'src/utils/jwt.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { FileUpload } from 'graphql-upload-minimal';
import { Readable } from 'stream';
import { UserQueryBuilderUtil } from 'src/common/user-query-builder.util';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly urlGeneratorService: UrlGeneratorService,
    private readonly fileUploadService: FileUploadService,
    private readonly emailService: EmailService,
    private readonly passwordHelper: PasswordHelper,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findAllPaginated(
    baseUrl: string,
    queryParams: any,
    page: number,
    limit: number,
    role?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedUserWithNumberOfPosts> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    UserQueryBuilderUtil.buildUserWithPostsQuery(
      queryBuilder,
      page,
      limit,
      role,
      sortBy,
      sortOrder,
    );

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

    const totalPages = Math.ceil(totalCount / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      users: userWithNumberOfPosts,
      total: totalCount,
      page: page,
      pageSize: limit,
      nextPage:
        this.urlGeneratorService.generateNextPageUrl2(
          nextPage,
          limit,
          baseUrl,
          queryParams,
        ) || '',
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
    if (updateUserDto.RoleId) {
      const role = await this.roleService.findRoleById(updateUserDto.RoleId); // Use the new RoleService method
      user.role = role; // Assign the Role entity
    }

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

  async uploadProfilePicture2(
    userId: number,
    file: FileUpload,
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
      // Convert the FileUpload stream to a buffer
      const { createReadStream, filename, mimetype } = file;
      const fileBuffer = await streamToBuffer(createReadStream());

      // Use FileUploadService to upload file and get the file key
      const fileKey = await this.fileUploadService.uploadFileGql({
        buffer: fileBuffer,
        originalname: filename,
        mimetype: mimetype,
      });

      // Get signed URL
      const signedUrl = await this.fileUploadService.getSignedUrlS(fileKey);
      user.profilePictureUrl = signedUrl;
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error uploading profile picture');
    }
  }

  async signup(signupDto: SignupDto): Promise<string> {
    const verificationToken = crypto.randomBytes(32).toString('hex'); // Generate a 6-character code

    const existingUser = await this.userRepository.findOneBy({
      email: signupDto.email,
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const user = this.userRepository.create({
      ...signupDto,
      isVerified: false, // User is not verified yet
      verificationToken, // Store the verification code
      //RoleId: 1, // by default user
    });
    // Send the verification code to the user's email
    const verificationLink = `${this.configService.get('APP_URL')}/verify-email?token=${verificationToken}`;
    await this.emailService.sendVerificationEmail(
      signupDto.email,
      verificationLink,
    );
    await this.userRepository.save(user);

    // Return a message to the user indicating that they need to verify their email
    return 'A verification link has been sent to your email. Please verify your account.';
  }

  async verifyEmail(token: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new BadRequestException('Invalid verification token.');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified.');
    }
    if (user.verificationToken === token) {
      user.isVerified = true;
      user.verificationToken = '';
      await this.userRepository.save(user);
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'isVerified',
        'verificationToken',
      ],
      relations: ['role'],
    });

    if (
      !user ||
      !(await this.passwordHelper.validatePassword(
        loginDto.password,
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user && !user.isVerified) {
      const verificationToken = user.verificationToken;
      const verificationLink = `${this.configService.get('APP_URL')}/verify-email?token=${verificationToken}`;
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationLink,
      );

      throw new UnauthorizedException(
        'Email not verified. A verification link has been sent to your email.',
      );
    }

    const role: RoleEnum = user.role.name as RoleEnum;
    const token = this.jwtService.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
    });

    // Return the token without setting the cookie
    return token;
  }

  validateToken(req: ExpressRequest) {
    const token = req.cookies['auth_token']; // Get the token from the cookie

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verifyToken(token); // Verify the token
      return decoded; // Return the decoded token if valid
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // adding find email by id, for sending emails to followers
  async getFollowerEmailById(followerId: number): Promise<string> {
    const follower = await this.findOne(followerId);
    return follower.email;
  }
}
