import { Resolver, Query, Args } from '@nestjs/graphql';
import { OverallProgress } from './dto/overallProgress.dto';
import { JobsProgressService } from './job.progress.service';

@Resolver()
export class JobProgressResolver {
  constructor(
    private readonly jobsProgressService: JobsProgressService, // Injecting the service
  ) {}

  @Query(() => OverallProgress)
  async overallJobProgress2(
    @Args('jobIds', { type: () => [String] }) jobIds: string[],
  ): Promise<OverallProgress> {
    // I am not using this now as it is individual job progress
    return this.jobsProgressService.calculateOverallProgress(Number(jobIds[0]));
  }

  @Query(() => OverallProgress)
  async overallJobProgress(
    @Args('postId', { type: () => Number }) postId: number, // Use postId instead of jobIds
  ): Promise<OverallProgress> {
    // Calculate overall progress based on postId
    return this.jobsProgressService.calculateOverallProgress(postId);
  }
}
