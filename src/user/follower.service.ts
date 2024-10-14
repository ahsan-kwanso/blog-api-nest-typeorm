import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from './entities/follower.entity'; // Adjust the path as needed

@Injectable()
export class FollowerService {
  constructor(
    @InjectRepository(Follower)
    private readonly followerRepository: Repository<Follower>,
  ) {}

  async getFollowersByUserId(userId: number): Promise<number[]> {
    const followers = await this.followerRepository.find({
      where: {
        followee: { id: userId }, // Use the followee relation
      },
      relations: ['follower'], // Load the follower relation
    });

    return followers.map((follower) => follower.follower.id); // Access follower's id
  }
}
