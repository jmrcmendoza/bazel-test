import Router from 'koa-router';
import {
  addContactController,
  deleteContactController,
} from 'src/controller/contacts';
import getContactController from 'src/controller/contacts/get-contacts';
import { koaCallback } from 'src/koa-callback';
import { verifyAuthorization } from 'src/library/verify-authorization';

export default function (router: Router) {
  router.post(
    '/contacts/:personId',
    verifyAuthorization,
    koaCallback(addContactController),
  );
  router.get(
    '/contacts',
    verifyAuthorization,
    koaCallback(getContactController),
  );
  router.delete(
    '/contacts/:personId',
    verifyAuthorization,
    koaCallback(deleteContactController),
  );
}
