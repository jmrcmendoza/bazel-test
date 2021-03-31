import { RouterContext } from 'src/types/context';
import { InvalidInputError } from 'src/library/error/invalid-input';
import assert from 'assert';

import Model from 'src/model';
import { MessageNotFoundError } from 'src/library/error/message-not-found';
import MessageModel from 'src/model/rethinkdb/message';

export default async function addReactionController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    params: { messageId },
    request: {
      body: { reaction },
    },
    state: { person },
  } = context;

  assert(person);

  if (!messageId) {
    throw new InvalidInputError('Message ID must be provided.');
  }

  const messageExist = await Model.Message.findById(messageId);

  if (!messageExist) {
    throw new MessageNotFoundError('Message does not exist.');
  }

  if (!reaction) {
    throw new InvalidInputError('Reaction must be provided.');
  }

  const result = await MessageModel.addReact(messageId, reaction, person.id);

  return {
    status: 200,
    body: result,
  };
}
