import { ChannelStatDbAdapter } from 'src/types/db-adapter';
import { ChannelStat } from 'src/types/common';
import rethinkdb from 'src/library/rethinkdb';
import r from 'rethinkdb';
import R from 'ramda';
import Model from './model';

class ChannelStatModel
  extends Model<ChannelStat, 'cursorDateTimeCreated' | 'channel'>
  implements ChannelStatDbAdapter {
  async createChannelStat(channel: string, persons: string[]) {
    const now = new Date();

    const data = R.map((person) => ({
      channel,
      person,
      count: 0,
      dateTimeCreated: now,
      dateTimeUpdated: now,
      cursorDateTimeCreated: now.getTime().toString(36),
    }))(persons);

    await this.table.insert(data).run(rethinkdb.connection);

    return true;
  }

  async markAsRead(channel: string, person: string) {
    await this.table
      .getAll(channel, { index: 'channel' })
      .filter({ person })
      .limit(1)
      .update({ count: 0 })
      .run(rethinkdb.connection);

    return true;
  }

  async incrementUnreadCount(channel: string, person: string) {
    await this.table
      .getAll(channel, { index: 'channel' })
      .filter(r.row('person').ne(person))
      .update({ count: r.row('count').add(1) })
      .run(rethinkdb.connection);

    return true;
  }

  async getUnreadCount(channel: string, person: string) {
    const cursor = await this.table
      .getAll(channel, { index: 'channel' })
      .filter({ person })
      .limit(1)
      .run(rethinkdb.connection);

    return R.head(await cursor.toArray()) || null;
  }
}

export default new ChannelStatModel('channelStat', {
  channel: Model.BasicIndex,
  cursorDateTimeCreated: Model.BasicIndex,
});
