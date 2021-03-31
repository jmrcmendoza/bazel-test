import Router from 'koa-router';
import {
  getAttachmentsController,
  getFileController,
  uploadAttachmentsController,
} from 'src/controller/attachments';
import { koaCallback } from 'src/koa-callback';
import { upload } from 'src/library/multer';
import { verifyAuthorization } from 'src/library/verify-authorization';

export default function (router: Router) {
  router.get('/attachments/file/:id', verifyAuthorization, getFileController);
  router.get(
    '/attachments/:channel',
    verifyAuthorization,
    koaCallback(getAttachmentsController),
  );
  router.post(
    '/attachments/:channel',
    verifyAuthorization,
    upload.any(),
    koaCallback(uploadAttachmentsController),
  );
}
