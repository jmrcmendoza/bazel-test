import Router from 'koa-router';
import {
  deleteDirectMessagesController,
  getDirectMessagesController,
  postDirectMessageController,
} from 'src/controller/direct-message';
import { koaCallback } from 'src/koa-callback';
import { verifyAuthorization } from 'src/library/verify-authorization';

export default function (router: Router) {
  router.post(
    '/direct-message/:recipient',
    verifyAuthorization,
    koaCallback(postDirectMessageController),
  );
  router.get(
    '/direct-message/:recipient',
    verifyAuthorization,
    koaCallback(getDirectMessagesController),
  );
  router.delete(
    '/direct-message/:recipient/:message',
    verifyAuthorization,
    koaCallback(deleteDirectMessagesController),
  );
}
