import { RouterContext } from 'src/types/context';
import { InvalidInputError } from 'src/library/error/invalid-input';
import { PersonNotFoundError } from 'src/library/error/person-not-found';
import R from 'ramda';

import assert from 'assert';

import Model from 'src/model';
import MessageModel from 'src/model/rethinkdb/message';
import paginate from 'src/library/pagination';

export default async function getDirectMessagesController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    params: { recipient },
    state: { person, integration },
    query: { first, after },
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

  const channel = R.reduce(
    (acc: string, value: string) => {
      if (acc) {
        return `${acc}:${value}`;
      }
      return value;
    },
    '',
    R.sortBy(R.identity)([person.id, recipient]),
  ) as any;

  const messages = await MessageModel.getMessages({ channel }, first, after);

  const result = paginate(first, messages);

  return {
    status: 200,
    body: result,
  };
}
