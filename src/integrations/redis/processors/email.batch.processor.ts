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
    const failedEmails: EmailJobData[] = []; // To store failed email jobs

    for (let i = 0; i < totalEmails; i += chunkSize) {
      const chunk = followers.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async ({ followerEmail, blogPost }: EmailJobData) => {
          try {
            if (followerEmail === 'm.ahsan+6@kwanso.com') {
              throw Error; // just for the sake of testing
            }
            await this.sendEmail(followerEmail, blogPost);
          } catch (error) {
            console.error(`Failed to send email to ${followerEmail}:`, error);
            failedEmails.push({ followerEmail, blogPost }); // Store failed email
          }
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
        console.log('Sending email for completion');
        //await this.sendCompletionEmail(authorEmail, postId); // uncomment this for real scenerios
        // delete that postId -> jobIds from redis have function implemented will later do that
      }
    }

    // If there are failed emails, create a new job to retry sending them
    if (failedEmails.length > 0) {
      console.log(`Adding retry job for ${failedEmails.length} failed emails.`);
      await job.queue.add(
        'retryFailedEmails',
        {
          failedEmails,
          postId,
          authorEmail,
        },
        {
          attempts: 2, // Max attempts for the retry job
          backoff: 5000, // Wait 5 seconds before retrying
        },
      );
      console.log('Retry job added successfully.');
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
