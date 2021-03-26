import { RouterContext } from 'src/types/context';
import assert from 'assert';

import Model from 'src/model';
import AttachmentModel from 'src/model/rethinkdb/attachment';
import { ChannelNotFoundError } from 'src/library/error/channel-not-found';
import paginate from 'src/library/pagination';

export default async function getAttachmentsController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    params: { channel },
    query: { first, after },
    state: { integration },
  } = context;

  assert(integration);

  const channelExist = await Model.Channel.findOne({
    id: channel,
    integration: integration.key,
  });

  if (!channelExist) {
    throw new ChannelNotFoundError('Channel does not exist.');
  }

  const attachments = await AttachmentModel.getAttachments(
    { channel, integration: integration.key },
    first as any,
    after as any,
  );

  const result = paginate(first as any, attachments);

  return {
    status: 200,
    body: result,
  };
}
