import Koa from 'koa';
import KoaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { Server } from 'http';

import personRoutes from 'src/routes/person';
import messageRoutes from 'src/routes/channel-message';
import channelRoutes from 'src/routes/channel';
import authenticateRoute from 'src/routes/authentication';
import documentationRoute from 'src/routes/documentation';
import directMessageRoutes from 'src/routes/direct-message';
import contactRoutes from 'src/routes/contacts';
import attachmentRoute from 'src/routes/attachments';

const app = new Koa();
let server: Server | null = null;

export async function start() {
  const router = new KoaRouter();

  app.use(
    bodyParser({
      jsonLimit: '2mb',
    }),
  );

  personRoutes(router);
  messageRoutes(router);
  channelRoutes(router);
  authenticateRoute(router);
  documentationRoute(router);
  directMessageRoutes(router);
  contactRoutes(router);
  attachmentRoute(router);

  app.use(router.routes());
  app.use(router.allowedMethods());

  server = app.listen(process.env.HTTP_PORT || 8000);
}

export function stop() {
  return new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}
