import Router from 'koa-router';
import {
  addReactionController,
  deleteChannelController,
  getChannelsController,
  getUnreadCountController,
  initiateChannelController,
  markAsReadController,
  removeReactionController,
} from 'src/controller/channel';
import { koaCallback } from 'src/koa-callback';
import { channelValidations } from 'src/library/channel-validations';
import { verifyAuthorization } from 'src/library/verify-authorization';

export default function (router: Router) {
  router.post('/channels', koaCallback(initiateChannelController));
  router.get('/channels', koaCallback(getChannelsController));
  router.delete('/channels/:channelId', koaCallback(deleteChannelController));
  router.get(
    '/channels/:channelId/unread-count',
    verifyAuthorization,
    channelValidations,
    koaCallback(getUnreadCountController),
  );
  router.put(
    '/channels/:channelId/mark-read',
    verifyAuthorization,
    channelValidations,
    koaCallback(markAsReadController),
  );
  router.put(
    '/channels/:channelId/message/:messageId/react',
    verifyAuthorization,
    channelValidations,
    koaCallback(addReactionController),
  );
  router.delete(
    '/channels/:channelId/message/:messageId/react',
    verifyAuthorization,
    channelValidations,
    koaCallback(removeReactionController),
  );
}
