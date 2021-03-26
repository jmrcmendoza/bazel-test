import { RouterContext } from 'src/types/context';
import assert from 'assert';

import Model from 'src/model';
import { ActionNotAllowError } from 'src/library/error/action-not-allowed';

import ContactModel from 'src/model/rethinkdb/contact';

import { PersonNotFoundError } from 'src/library/error/person-not-found';
import { ContactNotFoundError } from 'src/library/error/contact-not-found';

export default async function addContactController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    params: { personId },
    state: { person, integration },
  } = context;

  assert(person);
  assert(integration);

  if (!integration.contacts) {
    throw new ActionNotAllowError('Cannot add contact.');
  }

  const contactExist = await Model.Contact.findOne({ person: person.id });

  if (!contactExist) {
    throw new ContactNotFoundError('Contact does not exist.');
  }

  const personExist = await Model.Person.findOne({
    id: personId,
    integration: integration.key,
  });

  if (!personExist) {
    throw new PersonNotFoundError('Person does not exist.');
  }

  const result = await ContactModel.addContact(
    person.id,
    integration.key,
    personId,
  );

  return {
    status: 201,
    body: !!result,
  };
}
