import Router from 'koa-router';
import {
  deleteChannelMessageController,
  getChannelMessagesController,
  postMessageController,
} from 'src/controller/message';
import { koaCallback } from 'src/koa-callback';
import { channelValidations } from 'src/library/channel-validations';
import { verifyAuthorization } from 'src/library/verify-authorization';

export default function (router: Router) {
  router.post(
    '/channels/:channelId/message',
    verifyAuthorization,
    channelValidations,
    koaCallback(postMessageController),
  );
  router.get(
    '/channels/:channelId/message',
    verifyAuthorization,
    channelValidations,
    koaCallback(getChannelMessagesController),
  );
  router.delete(
    '/channels/:channelId/message/:messageId',
    verifyAuthorization,
    channelValidations,
    koaCallback(deleteChannelMessageController),
  );
}
