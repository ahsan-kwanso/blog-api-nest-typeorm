import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/comment.entity';
import { BaseEntity } from '../common/base.entity';

@Entity({ name: 'Posts' }) // Specify table name if needed
export class Post extends BaseEntity {
  @Column({ type: 'int', nullable: false })
  UserId: number;

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  @JoinColumn({ name: 'UserId' }) // needs to be specified
  user: User;

  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  content: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
