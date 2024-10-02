import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from '../../post/post.entity';
import { Comment } from '../../comment/comment.entity';
import { Role } from './role.entity';
import { BaseEntity } from '../../common/base.entity';

// separate table for role

@Entity({ name: 'Users' }) // Specify table name if needed, make common id , cat,uat separate class
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false, select: false }) // Exclude password by default
  password: string;

  @Column({ type: 'int', nullable: false, default: 1 })
  RoleId: number;

  // add a foreign key reference to the Role table, see many to many // currently set eager to true as per frontend requirements in current version
  @ManyToOne(() => Role, { eager: true }) //  { eager: true } not needed, now in responses no role is specified
  @JoinColumn({ name: 'RoleId' }) // Links to role table
  role: Role;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ type: 'varchar', length: 550, nullable: true })
  profilePictureUrl: string; // New column for profile picture URL
}
