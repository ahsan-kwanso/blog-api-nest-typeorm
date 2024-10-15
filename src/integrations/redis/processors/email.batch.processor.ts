import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BATCH_EMAIL_PROCESSOR_QUEUE } from 'src/utils/constants';

interface EmailJobData {
  followerEmail: string;
  blogPost: string; // Ensure Post is imported from your entity or model
}

@Processor(BATCH_EMAIL_PROCESSOR_QUEUE)
export class BatchEmailProcessor {
  @Process('sendEmailBatch')
  async handleSendEmailBatch(job: Job) {
    const { followers, chunkSize } = job.data;
    const totalEmails = followers.length;
    /*
    
     */
    for (let i = 0; i < totalEmails; i += chunkSize) {
      const chunk = followers.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async ({ followerEmail, blogPost }: EmailJobData) => {
          await this.sendEmail(followerEmail, blogPost);
        }),
      );

      // Delay between chunks to avoid overwhelming service
      await this.delay(20000);

      // Update job progress based on how many emails have been processed
      const processed = Math.min(i + chunkSize, totalEmails); // Ensure no overflow
      const progressPercentage = Math.round((processed / totalEmails) * 100);
      await job.progress(progressPercentage); // Update job progress
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
}
