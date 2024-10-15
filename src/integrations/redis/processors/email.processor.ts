import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EMAIL_PROCESSOR_QUEUE } from 'src/utils/constants';

@Processor(EMAIL_PROCESSOR_QUEUE) // specify this in an env
export class EmailProcessor {
  @Process('sendEmail')
  async handleSendEmailJob(job: Job) {
    const { followerEmail, blogPost } = job.data;

    // Mimic sending email with a delay
    setTimeout(() => {
      console.log(
        `Sending email to ${followerEmail} about the blog post "${blogPost.title}"`,
      );
    }, 2000); // Simulating delay with setTimeout
  }
}
