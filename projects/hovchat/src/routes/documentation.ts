/* eslint-disable consistent-return */
import Router from 'koa-router';
import path from 'path';
import { createReadStream } from 'fs';

export default function (router: Router) {
  router.get('/docs', async (ctx) => {
    ctx.type = 'html';
    ctx.body = createReadStream(
      path.join(__dirname, '../../documentation/api-reference.html'),
    );
  });
}
