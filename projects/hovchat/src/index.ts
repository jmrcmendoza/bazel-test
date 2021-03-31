import exitHook from 'async-exit-hook';

import initializeModels from 'src/model/rethinkdb';
import rethinkdb from 'src/library/rethinkdb';
import logger from './library/logger';
import * as api from './services/api';
import * as socketio from './services/socketio';

const services: { start: () => Promise<void>; stop: () => Promise<void> }[] = [
  api,
  socketio,
];

async function start() {
  await rethinkdb.start();
  await initializeModels();

  Promise.all(
    services.map((service) =>
      service.start().catch((e) => logger.tag('bootstrap').error(e)),
    ),
  );
}

start();

exitHook(() => {
  services.map((service) =>
    service.stop().catch((e) => logger.tag('bootstrap').error(e)),
  );
});
