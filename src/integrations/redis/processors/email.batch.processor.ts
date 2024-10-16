import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BATCH_EMAIL_PROCESSOR_QUEUE } from 'src/utils/constants';
import { JobsProgressService } from '../job.progress.service';
import { EmailService } from 'src/integrations/sg/email.service';

interface EmailJobData {
  followerEmail: string;
  blogPost: string;
}

@Processor(BATCH_EMAIL_PROCESSOR_QUEUE)
export class BatchEmailProcessor {
  constructor(
    private readonly jobsProgressService: JobsProgressService,
    private readonly emailService: EmailService,
  ) {}

  @Process('sendEmailBatch')
  async handleSendEmailBatch(job: Job) {
    const { followers, chunkSize, postId, authorEmail } = job.data;
    const totalEmails = followers.length;

    for (let i = 0; i < totalEmails; i += chunkSize) {
      const chunk = followers.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async ({ followerEmail, blogPost }: EmailJobData) => {
          await this.sendEmail(followerEmail, blogPost);
        }),
      );

      // Delay between chunks to avoid overwhelming the service
      await this.delay(2000);

      // Update job progress based on how many emails have been processed
      const processed = Math.min(i + chunkSize, totalEmails);
      const progressPercentage = Math.round((processed / totalEmails) * 100);
      await job.progress(progressPercentage);

      // Track overall job progress for the post
      const overallProgress =
        await this.jobsProgressService.calculateOverallProgress(postId);

      // Check if overall progress has reached 100%
      if (overallProgress.overallProgressPercentage === 100) {
        console.log('sending email for completion');
        await this.sendCompletionEmail(authorEmail, postId);
      }
    }
  }

  private async sendEmail(followerEmail: string, blogPost: string) {
    console.log(
      `Sending email to ${followerEmail} about the blog post "${blogPost}"`,
    );
    return new Promise((resolve) => setTimeout(resolve, 500)); // Simulate email sending delay
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async sendCompletionEmail(authorEmail: string, postId: string) {
    const subject = `All Emails Sent for Post ID ${postId}`;
    const message = `All followers have been successfully emailed about your post (ID: ${postId}).`;
    try {
      await this.emailService.sendEmail(authorEmail, subject, message); // Call the existing sendEmail method
    } catch (error) {
      console.error('Error sending completion email:', error);
    }
  }
}
