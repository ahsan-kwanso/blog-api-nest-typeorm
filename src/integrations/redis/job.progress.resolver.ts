import { Resolver, Query, Args } from '@nestjs/graphql';
import { OverallProgress } from './dto/overallProgress.dto';
import { JobsProgressService } from './job.progress.service';
import { RedisService } from './redis.service';

@Resolver()
export class JobProgressResolver {
  constructor(
    private readonly jobsProgressService: JobsProgressService, // Injecting the service
    private readonly redisService: RedisService,
  ) {}

  @Query(() => OverallProgress)
  async overallJobProgress2(
    @Args('jobIds', { type: () => [String] }) jobIds: string[],
  ): Promise<OverallProgress> {
    return this.jobsProgressService.calculateOverallProgress(jobIds);
  }

  @Query(() => OverallProgress)
  async overallJobProgress(
    @Args('postId', { type: () => Number }) postId: number, // Use postId instead of jobIds
  ): Promise<OverallProgress> {
    // Get the jobIds associated with the postId
    const jobIds = await this.redisService.getJobsByPostId(postId);
    // Calculate overall progress based on jobIds
    return this.jobsProgressService.calculateOverallProgress(jobIds);
  }
}
