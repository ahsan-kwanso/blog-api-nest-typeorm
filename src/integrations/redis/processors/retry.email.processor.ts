import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from 'src/integrations/sg/email.service';
import { BATCH_EMAIL_PROCESSOR_QUEUE } from 'src/utils/constants';

interface EmailJobData {
  followerEmail: string;
  blogPost: string;
}

// will add retry in chunks

@Processor(BATCH_EMAIL_PROCESSOR_QUEUE)
export class RetryEmailProcessor {
  constructor(private readonly emailService: EmailService) {}

  @Process('retryFailedEmails')
  async handleRetryFailedEmails(job: Job) {
    const { failedEmails, postId, authorEmail } = job.data;

    await Promise.all(
      failedEmails.map(async ({ followerEmail, blogPost }: EmailJobData) => {
        try {
          await this.sendEmail(followerEmail, blogPost);
          console.log(
            `Retried email sent to ${followerEmail} about "${blogPost}".`,
          );
        } catch (error) {
          console.error(
            `Failed again to send email to ${followerEmail}:`,
            error,
          );
          // Optionally, log this somewhere or notify the author
        }
      }),
    );

    // You can add any additional handling here if necessary
  }

  private async sendEmail(followerEmail: string, blogPost: string) {
    console.log(
      `Sending email to ${followerEmail} about the blog post "${blogPost}"`,
    );
    return new Promise((resolve) => setTimeout(resolve, 500)); // Simulate email sending delay
  }
}
