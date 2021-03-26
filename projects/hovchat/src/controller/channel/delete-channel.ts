import { RouterContext } from 'src/types/context';
import { IntegrationKeyNotFoundError } from 'src/library/error/integration-key-not-found';
import { InvalidInputError } from 'src/library/error/invalid-input';
import { InvalidIntegrationKeyError } from 'src/library/error/invalid-integration-key';

import Model from 'src/model';
import { ChannelNotFoundError } from 'src/library/error/channel-not-found';

export default async function deleteChannelController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const integration = context.get('Integration-Key');
  const {
    params: { channelId },
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

  if (!channelId) {
    throw new InvalidInputError('Channel Id must be provided.');
  }

  const channelExist = await Model.Channel.findById(channelId);

  if (!channelExist) {
    throw new ChannelNotFoundError('Channel does not exist.');
  }

  const result: any = await Model.Channel.findByIdAndUpdate(channelId, {
    archived: true,
  });

  return {
    status: 200,
    body: !!result,
  };
}
