import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

interface EmailJobData {
  followerEmail: string;
  blogPost: string; // Ensure Post is imported from your entity or model
}

@Processor('emailbatch')
export class BatchEmailProcessor {
  @Process('sendEmailBatch')
  async handleSendEmailBatch(job: Job) {
    const { followers, chunkSize } = job.data;

    for (let i = 0; i < followers.length; i += chunkSize) {
      // Get the current chunk of followers
      const chunk = followers.slice(i, i + chunkSize);
      // Process each email in the chunk
      await Promise.all(
        chunk.map(async ({ followerEmail, blogPost }: EmailJobData) => {
          await this.sendEmail(followerEmail, blogPost);
        }),
      );

      // Delay between sending chunks to avoid overwhelming the service
      await this.delay(2000); // 2 seconds delay
    }
  }

  private async sendEmail(followerEmail: string, blogPost: string) {
    console.log(
      `Sending email to ${followerEmail} about the blog post "${blogPost}"`,
    );
    // Simulate sending email (implement your email sending logic here)
    return new Promise((resolve) => setTimeout(resolve, 500)); // Simulate email sending delay
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
