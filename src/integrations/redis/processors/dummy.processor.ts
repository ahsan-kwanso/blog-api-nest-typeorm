import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { DUMMY_PROCESSOR_QUEUE } from 'src/utils/constants';

@Processor(DUMMY_PROCESSOR_QUEUE)
export class DummyProcessor {
  @Process('dummyTask')
  async handleDummyTask(job: Job) {
    console.log(`Processing dummy task with data: ${JSON.stringify(job.data)}`);

    // Simulating a delay (like a heavy computation or API call)
    setTimeout(() => {
      console.log('Dummy task completed');
    }, 10000); // Simulating a 1-second delay
  }
}
