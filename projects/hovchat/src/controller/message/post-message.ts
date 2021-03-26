import { RouterContext } from 'src/types/context';
import { InvalidInputError } from 'src/library/error/invalid-input';
import assert from 'assert';

import Model from 'src/model';
import ChannelStatModel from 'src/model/rethinkdb/channel-stat';

export default async function postMessageController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    request: {
      body: { body, attachments },
    },
    state: { person, integration, channel },
  } = context;

  assert(channel);
  assert(person);
  assert(integration);

  if (!body) {
    throw new InvalidInputError('Message must be provided.');
  }

  const result: any = await Model.Message.create({
    body,
    sender: person.id,
    integration: integration.key,
    channel: channel.id,
    attachments: attachments || [],
  });

  await ChannelStatModel.incrementUnreadCount(channel.id, person.id);

  return {
    status: 201,
    body: !!result,
  };
}
