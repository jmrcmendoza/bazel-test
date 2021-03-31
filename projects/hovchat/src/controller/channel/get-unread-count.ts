import { RouterContext } from 'src/types/context';
import assert from 'assert';

import ChannelStatModel from 'src/model/rethinkdb/channel-stat';

export default async function getUnreadCountController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    state: { person, channel },
  } = context;

  assert(person);
  assert(channel);

  const result = await ChannelStatModel.getUnreadCount(channel.id, person.id);

  return {
    status: 200,
    body: result,
  };
}
