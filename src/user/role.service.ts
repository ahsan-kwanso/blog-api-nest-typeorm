import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    // Check if roles already exist
    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!userRole) {
      await this.roleRepository.save({ name: 'user' });
    }

    if (!adminRole) {
      await this.roleRepository.save({ name: 'admin' });
    }
  }
}
