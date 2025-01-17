import { RouterContext } from 'src/types/context';
import MessageModel from 'src/model/rethinkdb/message';

import assert from 'assert';

import paginate from 'src/library/pagination';

export default async function getChannelMessagesController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    state: { channel },
    query: { first, after },
  } = context;

  assert(channel);

  const messages = await MessageModel.getMessages(
    { channel: channel.id },
    first,
    after,
  );

  const result = paginate(first, messages);

  return {
    status: 200,
    body: result,
  };
}
