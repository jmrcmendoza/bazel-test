/* eslint-disable radix */
import { MessageDbAdapter } from 'src/types/db-adapter';
import { Message } from 'src/types/common';
import rethinkdb from 'src/library/rethinkdb';
import r from 'rethinkdb';
import Model from './model';

class MessageModel
  extends Model<Message, 'cursorDateTimeCreated'>
  implements MessageDbAdapter {
  sanitizeCreateParam(obj: Partial<Message>) {
    const now = new Date();
    return {
      ...obj,
      archived: false,
      dateTimeCreated: now,
      dateTimeUpdated: now,
      cursorDateTimeCreated: now.getTime().toString(36),
    } as Message;
  }

  async getMessages(
    filter: { channel: string },
    first = '1000',
    after: string,
    cursorField = 'cursorDateTimeCreated',
  ) {
    const query = this.table
      .filter({
        channel: filter.channel,
        archived: false,
      })
      .filter(after ? r.row(cursorField).lt(after) : {})
      .orderBy(r.desc(cursorField));

    const cursor = await query
      .limit(parseInt(first) + 1)
      .run(rethinkdb.connection);

    return cursor.toArray();
  }

  async addReact(id: string, name: string, person: string) {
    const reactions: any = {};
    reactions[name] = (r.row('reactions')(name).default([]) as any).setInsert(
      person,
    );

    await this.table.get(id).update({ reactions }).run(rethinkdb.connection);

    return true;
  }

  async removeReact(id: string, name: string, person: string) {
    const reactions: any = {};
    reactions[name] = (r.row('reactions')(name) as any).difference([person]);

    await this.table.get(id).update({ reactions }).run(rethinkdb.connection);

    return true;
  }
}

export default new MessageModel('messages', {
  cursorDateTimeCreated: Model.BasicIndex,
});
