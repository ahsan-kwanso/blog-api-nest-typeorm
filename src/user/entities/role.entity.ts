import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Should only contain 'user' or 'admin'

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
