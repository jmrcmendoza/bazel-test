import { PersonDbAdapter } from 'src/types/db-adapter';
import { Person } from 'src/types/common';
import { InvalidInputError } from 'src/library/error/invalid-input';
import rethinkdb from 'src/library/rethinkdb';
import R from 'ramda';
import Model from './model';

class PersonModel
  extends Model<Person, 'cursorDateTimeCreated' | 'integration'>
  implements PersonDbAdapter {
  sanitizeUpdateParam(obj: Partial<Person>) {
    return {
      ...obj,
      dateTimeUpdated: new Date(),
    };
  }

  sanitizeCreateParam(obj: Partial<Person>) {
    const { id, integration } = obj;
    if (!id) {
      throw new InvalidInputError('Missing id in person.');
    }

    if (!integration) {
      throw new InvalidInputError('Missing integration in person.');
    }

    const now = new Date();
    return {
      id,
      integration,
      meta: obj.meta || {},
      archived: false,
      status: null,
      connectionStatus: 'offline',
      dateTimeCreated: now,
      dateTimeUpdated: now,
      cursorDateTimeCreated: now.getTime().toString(36),
    };
  }

  async findPerson(id: string, integration: string) {
    const cursor = await this.table
      .getAll(integration, { index: 'integration' })
      .filter({ id, archived: false })
      .run(rethinkdb.connection);

    return R.head(await cursor.toArray()) || null;
  }
}

export default new PersonModel('persons', {
  integration: Model.BasicIndex,
  cursorDateTimeCreated: Model.BasicIndex,
});
