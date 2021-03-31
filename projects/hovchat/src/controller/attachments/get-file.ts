// import { Context } from 'src/types/context';
import tryToCatch from 'try-to-catch';
import send from 'koa-send';
import path from 'path';

import Model from 'src/model';
import { AttachmentNotFoundError } from 'src/library/error/attachment-not-found';
import { ApplicationError } from 'src/library/error';
import { RouterContext } from 'src/types/context';

export const middleware = { send };

export default async function getFileController(
  context: RouterContext & { files: any; file: any },
): Promise<void> {
  const [err, payload] = await tryToCatch(async () => {
    const {
      params: { id },
    } = context;

    const attachment = await Model.Attachment.findById(id);

    if (!attachment) {
      throw new AttachmentNotFoundError('Attachment does not exist.');
    }

    return attachment;
  });

  if (err) {
    if (err instanceof ApplicationError) {
      context.status = err.status;
      context.body = { error: err.message };
      return;
    }

    context.status = 500;
    context.body = {
      error: 'An unkown error occurred.',
    };

    return;
  }

  await middleware.send(context, payload.path, {
    root: path.join(__dirname, '/../../../'),
  });
}
