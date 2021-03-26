import { RouterContext } from 'src/types/context';
import { IntegrationKeyNotFoundError } from 'src/library/error/integration-key-not-found';
import { InvalidInputError } from 'src/library/error/invalid-input';
import { InvalidIntegrationKeyError } from 'src/library/error/invalid-integration-key';
import { PersonNotFoundError } from 'src/library/error/person-not-found';

import Model from 'src/model';

export default async function deletePersonController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const integration = context.get('Integration-Key');
  const {
    params: { id },
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

  if (!idExists) {
    throw new PersonNotFoundError('Person Id does not exist.');
  }

  const result: any = await Model.Person.findByIdAndUpdate(id, {
    archived: true,
  });

  return {
    status: 200,
    body: !!result,
  };
}
