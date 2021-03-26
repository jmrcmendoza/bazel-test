import { RouterContext } from 'src/types/context';
import assert from 'assert';

import ChannelStatModel from 'src/model/rethinkdb/channel-stat';

export default async function markAsReadController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    state: { person, channel },
  } = context;

  assert(person);
  assert(channel);

  const result: boolean = await ChannelStatModel.markAsRead(
    channel.id,
    person.id,
  );

  return {
    status: 200,
    body: result,
  };
}
