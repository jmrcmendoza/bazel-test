import { RouterContext } from 'src/types/context';
import assert from 'assert';

import Model from 'src/model';
import AttachmentModel from 'src/model/rethinkdb/attachment';
import { ChannelNotFoundError } from 'src/library/error/channel-not-found';
import { UploadError } from 'src/library/error/upload-error';

export default async function uploadAttachmentsController(
  context: RouterContext & { files: any },
): Promise<Record<string, any>> {
  const {
    params: { channel },
    files,
    state: { person, integration },
  } = context;

  assert(person);
  assert(integration);

  const channelExist = await Model.Channel.findOne({
    id: channel,
    integration: integration.key,
  });

  if (!channelExist) {
    throw new ChannelNotFoundError('Channel does not exist.');
  }

  if (!files) {
    throw new UploadError('Upload failed.');
  }

  const result = await AttachmentModel.insertAttachments(
    files,
    person.id,
    channel,
    integration.key,
  );

  return {
    status: 201,
    body: result,
  };
}
