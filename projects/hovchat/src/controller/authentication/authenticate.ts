import { RouterContext } from 'src/types/context';
import { create } from 'src/library/auth';
import { IntegrationKeyNotFoundError } from 'src/library/error/integration-key-not-found';
import { InvalidInputError } from 'src/library/error/invalid-input';
import { InvalidIntegrationKeyError } from 'src/library/error/invalid-integration-key';
import { PersonNotFoundError } from 'src/library/error/person-not-found';

import Model from 'src/model';

export default async function authenticateController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const integration = context.get('Integration-Key');
  const {
    request: {
      body: { person },
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

  if (!person) {
    throw new InvalidInputError('Person must be provided.');
  }

  const personExists = await Model.Person.findOne({
    id: person,
    integration,
  });

  if (personExists?.archived) {
    throw new PersonNotFoundError('Person does not exist.');
  }

  if (!personExists) {
    await Model.Person.create({
      id: person,
      integration,
    });
  }

  const token: string = await create({
    integrationKey: integration,
    person,
  });

  return {
    status: 201,
    body: { token },
  };
}
