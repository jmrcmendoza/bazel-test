import Http from 'http';
import SocketIO from 'socket.io';
import assert from 'assert';
import R from 'ramda';
import tryToCatch from 'try-to-catch';
import ms from 'ms';

import { verify } from 'src/library/auth';
import Logger from 'src/library/logger';

import { ClientTokenPayload } from 'src/types/common';
import AuthenticationError from 'src/library/error/authentication';

import Model from 'src/model';

import registerChannelHandler from 'src/notification-handler/channel';
import registerMessageHandler from 'src/notification-handler/message';
import registePersonHandler from 'src/notification-handler/person';
import notification from 'src/notification';
import { SocketIOContext } from 'src/types/context';
import Notification from 'src/notification/rethinkdb';

const logger = Logger.tag('socket.io');
let httpServer: Http.Server | null;

export async function start() {
  logger.tag('bootstrap').verbose('Initializing socket server.');
  httpServer = Http.createServer();
  const socketServer = new SocketIO.Server(httpServer, {
    path: '/',
  });

  socketServer.use(async (socket, next) => {
    logger
      .tag(['middleware', 'authentication'])
      .verbose({ handshake: socket.handshake });

    const { token } = socket.handshake.auth;
    const unauthorizedConnection = () => {
      socket.send({
        ok: false,
        error: new AuthenticationError().name,
        message: 'connection will be closed after 3 seconds.',
      });
      setTimeout(() => socket.disconnect(), ms('3s'));
      next();
    };

    if (!token) {
      logger
        .tag(['connection', 'token', 'authentication'])
        .warn('Received a request without a token.');
      unauthorizedConnection();
      return;
    }

    const [error, payload]: [
      Error | null,
      ClientTokenPayload,
    ] = await tryToCatch(() => verify(token));

    if (error || R.isNil(payload.person) || R.isNil(payload.integrationKey)) {
      logger.tag(['connection', 'authentication']).warn({
        error,
        payload,
      });
      unauthorizedConnection();
      return;
    }

    const integration = await Model.Integration.findOne({
      key: payload.integrationKey,
    });

    if (!integration) {
      logger
        .tag(['connection', 'authentication'])
        .warn('Integration key not found');
      unauthorizedConnection();
      return;
    }

    let person = await Model.Person.findById(payload.person);

    if (!person) {
      Model.Person.create({
        id: payload.person,
        integration: payload.integrationKey,
      });
      person = { id: payload.person } as any;
    }

    assert(person);
    Object.assign(socket, {
      state: { person: person.id, integration: integration.id },
    });

    logger
      .tag(['middleware', 'authentication', 'successful'])
      .verbose({ payload });
    next();
  });

  socketServer.on('connection', async (socket: SocketIOContext) => {
    if (!R.path(['state', 'person'], socket)) {
      return;
    }

    socket.join(socket.state.integration);

    await Model.Person.findByIdAndUpdate(socket.state.person, {
      connectionStatus: 'online',
    });

    registerChannelHandler(socketServer, socket, notification);
    registerMessageHandler(socketServer, socket, notification);
    registePersonHandler(socketServer, socket, notification);

    socket.on('disconnect', async () => {
      await Model.Person.findByIdAndUpdate(socket.state.person, {
        connectionStatus: 'offline',
      });
    });

    socket.send({ ok: true });
  });

  const port = process.env.SOCKET_PORT || 8001;
  httpServer.listen(port);

  await Notification.start();

  logger.tag('bootstrap').verbose(`Socket has been started at port ${port}`);
}

export async function stop() {
  logger.verbose('Stopping...');
  return new Promise<void>((resolve, reject) => {
    if (!httpServer) {
      resolve();
      return;
    }

    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
      logger.verbose('Server successfully stopped.');
    });
  });
}
