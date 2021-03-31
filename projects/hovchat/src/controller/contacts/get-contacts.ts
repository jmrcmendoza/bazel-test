import { RouterContext } from 'src/types/context';
import assert from 'assert';

import ContactModel from 'src/model/rethinkdb/contact';
import { ActionNotAllowError } from 'src/library/error/action-not-allowed';

export default async function getContactController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    state: { person, integration },
  } = context;

  assert(person);
  assert(integration);

  if (!integration.contacts) {
    throw new ActionNotAllowError('Cannot add contact.');
  }

  const result: any = await ContactModel.getContacts(
    person.id,
    integration.key,
  );

  return {
    status: 200,
    body: result,
  };
}
