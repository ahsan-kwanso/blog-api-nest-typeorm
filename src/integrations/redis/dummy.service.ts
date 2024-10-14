import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DummyService {
  constructor(
    @InjectQueue('dummy') private dummyQueue: Queue,
  ) {}

  async addMultipleDummyTasks(taskCount: number) {
    for (let i = 0; i < taskCount; i++) {
      console.log(`Adding dummy task ${i + 1} to the queue...`);

      // Mimicking the creation of tasks with varying data
      await this.dummyQueue.add('dummyTask', {
        message: `This is dummy task #${i + 1}`,
        taskId: i + 1,
        timestamp: new Date(),
      });
    }

    return `Added ${taskCount} tasks to the queue!`;
  }
}
