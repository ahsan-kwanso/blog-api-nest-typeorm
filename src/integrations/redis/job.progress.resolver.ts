import { Resolver, Query, Args } from '@nestjs/graphql';
import { OverallProgress } from './dto/overallProgress.dto';
import { JobsProgressService } from './job.progress.service';

@Resolver()
export class JobProgressResolver {
  constructor(
    private readonly jobsProgressService: JobsProgressService, // Injecting the service
  ) {}

  @Query(() => OverallProgress)
  async overallJobProgress(
    @Args('jobIds', { type: () => [String] }) jobIds: string[],
  ): Promise<OverallProgress> {
    return this.jobsProgressService.calculateOverallProgress(jobIds);
  }
}
