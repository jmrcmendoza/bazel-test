import { RouterContext } from 'src/types/context';
import { DuplicateIdError } from 'src/library/error/duplicate-id';
import { IntegrationKeyNotFoundError } from 'src/library/error/integration-key-not-found';
import { InvalidInputError } from 'src/library/error/invalid-input';
import { InvalidIntegrationKeyError } from 'src/library/error/invalid-integration-key';

import Model from 'src/model';

export default async function createPersonController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const integration = context.get('Integration-Key');
  const {
    request: {
      body: { id },
    },
  } = context;

  if (!integration) {
    throw new InvalidIntegrationKeyError('Integration Key must be provided.');
  }

  const keyExists = await Model.Integration.findOne({
    key: integration,
  });

  if (!keyExists) {
    throw new IntegrationKeyNotFoundError('Integration Key does not exist.');
  }

  if (!id) {
    throw new InvalidInputError('ID must be provided.');
  }

  const idExists = await Model.Person.findById(id);

  if (idExists) {
    throw new DuplicateIdError('Person Id already exist.');
  }

  const result: any = await Model.Person.create({
    id,
    integration,
  });

  await Model.Contact.create({
    integration,
    person: id,
    contacts: [],
  });

  return {
    status: 201,
    body: !!result,
  };
}
