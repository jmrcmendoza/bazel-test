import { ChannelDbAdapter } from 'src/types/db-adapter';
import { Channel } from 'src/types/common';
import Model from './model';

class ChannelModel
  extends Model<Channel, 'cursorDateTimeCreated'>
  implements ChannelDbAdapter {
  sanitizeCreateParam(obj: Partial<Channel>) {
    const now = new Date();

    return {
      ...obj,
      meta: obj.meta || {},
      archived: false,
      dateTimeCreated: now,
      dateTimeUpdated: now,
      cursorDateTimeCreated: now.getTime().toString(36),
    } as Channel;
  }
}

export default new ChannelModel('channels', {
  cursorDateTimeCreated: Model.BasicIndex,
});
