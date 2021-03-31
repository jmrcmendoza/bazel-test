import Router from 'koa-router';
import {
  createPersonController,
  deletePersonController,
  updatePersonController,
} from 'src/controller/person';
import { koaCallback } from 'src/koa-callback';
import { verifyAuthorization } from 'src/library/verify-authorization';

export default function (router: Router) {
  router.post('/persons', koaCallback(createPersonController));
  router.delete('/persons/:id', koaCallback(deletePersonController));
  router.put(
    '/persons',
    verifyAuthorization,
    koaCallback(updatePersonController),
  );
}
