import { RouterContext } from 'src/types/context';
import { IntegrationKeyNotFoundError } from 'src/library/error/integration-key-not-found';
import { InvalidIntegrationKeyError } from 'src/library/error/invalid-integration-key';

import Model from 'src/model/';

export default async function getChannelsController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const integration = context.get('Integration-Key');

  if (!integration) {
    throw new InvalidIntegrationKeyError('Integration Key must be provided.');
  }
  const keyExists = await Model.Integration.findOne({
    key: integration,
  });

  if (!keyExists) {
    throw new IntegrationKeyNotFoundError('Integration Key does not exist.');
  }

  const result: any = await Model.Channel.find({
    integration,
    archived: false,
  });

  return {
    status: 200,
    body: result,
  };
}
