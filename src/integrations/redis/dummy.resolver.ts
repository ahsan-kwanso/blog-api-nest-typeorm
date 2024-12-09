import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { DummyService } from './dummy.service';
import { Public } from 'src/common/public.decorator';

@Resolver()
export class DummyResolver {
  constructor(private readonly dummyService: DummyService) {}

  @Public()
  @Query(() => String)
  async testRedis(
    @Args('taskCount', { type: () => Int, defaultValue: 5 }) taskCount: number,
  ) {
    // Add multiple dummy tasks to the queue
    return await this.dummyService.addMultipleDummyTasks(taskCount);
  }
}
