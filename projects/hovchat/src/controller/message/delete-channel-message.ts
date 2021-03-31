import { RouterContext } from 'src/types/context';
import { InvalidInputError } from 'src/library/error/invalid-input';
import assert from 'assert';

import Model from 'src/model';
import { MessageNotFoundError } from 'src/library/error/message-not-found';

export default async function deleteChannelMessageController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    params: { messageId },
    state: { person, integration, channel },
  } = context;

  assert(channel);
  assert(person);
  assert(integration);

  if (!messageId) {
    throw new InvalidInputError('Message ID must be provided.');
  }

  const messageExist = await Model.Message.findById(messageId);

  if (!messageExist) {
    throw new MessageNotFoundError('Message does not exist.');
  }

  const result: any = await Model.Message.findByIdAndUpdate(messageId, {
    archived: true,
  });

  return {
    status: 200,
    body: result,
  };
}
