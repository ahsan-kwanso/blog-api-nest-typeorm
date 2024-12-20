import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { OverallProgress } from './dto/overallProgress.dto';
import { BATCH_EMAIL_PROCESSOR_QUEUE } from 'src/utils/constants';
import { InjectQueue } from '@nestjs/bull';
import { RedisService } from './redis.service';

@Injectable()
export class JobsProgressService {
  constructor(
    private readonly redisService: RedisService,
    @InjectQueue(BATCH_EMAIL_PROCESSOR_QUEUE) private readonly jobQueue: Queue,
  ) {}

  async calculateOverallProgress(postId: number): Promise<OverallProgress> {
    // Get the jobIds associated with the postId
    const jobIds = await this.redisService.getJobsByPostId(postId);
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
