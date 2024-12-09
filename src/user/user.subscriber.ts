import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }
  // this above constructor is important bcz if you want to enable susbscribers at module level you have to do this else you have to define the subscriber in database module
  /**
   * Listen to which entity the subscriber is attached.
   */
  listenTo() {
    return User;
  }

  /**
   * Hash the password using bcrypt.
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Before a User is inserted into the database, hash the password.
   */
  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    if (event.entity.password) {
      event.entity.password = await this.hashPassword(event.entity.password);
    }
  }

  /**
   * Before a User is updated in the database, hash the password if it has changed.
   */
  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    if (
      event.entity?.password &&
      event.entity.password !== event.databaseEntity?.password
    ) {
      event.entity.password = await this.hashPassword(event.entity.password);
    }
  }
}
