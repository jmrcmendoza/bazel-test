import { v4 as uuidv4 } from 'uuid';
import {
  IntegrationCreateParam,
  IntegrationDbAdapter,
} from 'src/types/db-adapter';
import { Integration } from 'src/types/common';
import rethinkdb from 'src/library/rethinkdb';
import R from 'ramda';
import Model from './model';

class IntegrationModel
  extends Model<Integration, 'key' | 'cursorDateTimeCreated'>
  implements IntegrationDbAdapter {
  sanitizeCreateParam(obj: IntegrationCreateParam) {
    return {
      id: uuidv4(),
      key: obj.key,
      contacts: obj.contacts || false,
    };
  }

  async findByKey(key: string) {
    const cursor = await this.table
      .getAll(key, { index: 'key' })
      .limit(1)
      .run(rethinkdb.connection);

    return R.head(await cursor.toArray()) || null;
  }
}

export default new IntegrationModel('integrations', {
  key: Model.BasicIndex,
  cursorDateTimeCreated: Model.BasicIndex,
});
