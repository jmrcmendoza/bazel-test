import Router from 'koa-router';
import { authenticateController } from 'src/controller/authentication';
import { koaCallback } from 'src/koa-callback';

export default function (router: Router) {
  router.post('/authenticate', koaCallback(authenticateController));
}
