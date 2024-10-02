import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  /**
   * Listen to which entity the subscriber is attached.
   */
  listenTo() {
    return User;
  }

  /**
   * Before a User is inserted into the database, hash the password.
   */
  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    if (event.entity.password) {
      const salt = await bcrypt.genSalt(10);
      event.entity.password = await bcrypt.hash(event.entity.password, salt);
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
      const salt = await bcrypt.genSalt(10);
      event.entity.password = await bcrypt.hash(event.entity.password, salt);
    }
  }
}
