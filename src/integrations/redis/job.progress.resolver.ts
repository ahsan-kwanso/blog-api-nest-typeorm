import { Resolver, Query, Args } from '@nestjs/graphql';
import { Job, Queue } from 'bull';
import { ObjectType, Field } from '@nestjs/graphql';
import { InjectQueue } from '@nestjs/bull';
import { BATCH_EMAIL_PROCESSOR_QUEUE } from 'src/utils/constants';

@ObjectType()
class OverallProgress {
  @Field()
  totalEmails: number;

  @Field()
  emailsProcessed: number;

  @Field()
  overallProgressPercentage: number;
}

@Resolver()
export class JobProgressResolver {
  constructor(
    @InjectQueue(BATCH_EMAIL_PROCESSOR_QUEUE) private readonly jobQueue: Queue, // Injecting the specific queue
  ) {}

  @Query(() => OverallProgress)
  async overallJobProgress(
    @Args('jobIds', { type: () => [String] }) jobIds: string[],
  ): Promise<OverallProgress> {
    let totalEmails = 0; // Total emails across all jobs
    let emailsProcessed = 0; // Processed emails across all jobs

    // Iterate over each jobId to compute progress
    for (const jobId of jobIds) {
      const job: Job | null = await this.jobQueue.getJob(jobId);

      if (job) {
        const { followers, chunkSize } = job.data;
        const jobTotalEmails = followers.length;
        const jobProgress = await job.progress(); // Get current job progress (percentage)

        // Calculate the number of emails processed for this job
        const jobEmailsProcessed = Math.round(
          (jobProgress / 100) * jobTotalEmails,
        );

        // Accumulate the total emails and processed emails
        totalEmails += jobTotalEmails;
        emailsProcessed += jobEmailsProcessed;
      }
    }

    // Calculate overall progress as a percentage
    const overallProgressPercentage =
      totalEmails > 0 ? Math.round((emailsProcessed / totalEmails) * 100) : 0;

    return {
      totalEmails,
      emailsProcessed,
      overallProgressPercentage,
    };
  }
}
