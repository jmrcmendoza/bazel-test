import { RouterContext } from 'src/types/context';
import { InvalidInputError } from 'src/library/error/invalid-input';
import assert from 'assert';
import { PersonNotFoundError } from 'src/library/error/person-not-found';

import Model from 'src/model';
import { MessageNotFoundError } from 'src/library/error/message-not-found';

export default async function deleteDirectMessageController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    params: { recipient, message },
    state: { person, integration },
  } = context;

  assert(person);
  assert(integration);

  if (!recipient) {
    throw new InvalidInputError('Recipient must be provided.');
  }

  const recipientExist = await Model.Person.findOne({
    id: recipient,
    integration: integration.key,
  });

  if (!recipientExist) {
    throw new PersonNotFoundError('Recipient does not exist.');
  }

  if (!message) {
    throw new InvalidInputError('Message id must be provided.');
  }

  const messageExist = await Model.Message.findById(message);

  if (!messageExist) {
    throw new MessageNotFoundError('Message does not exist.');
  }

  const result: any = await Model.Message.findByIdAndUpdate(message, {
    archived: true,
  });

  return {
    status: 200,
    body: result,
  };
}
