import SocketIO from 'socket.io';
import Notification from 'src/notification/notification';
import { Person } from 'src/types/common';
import { SocketIOContext } from 'src/types/context';
import sendToIntegration from './utilities/send-to-integration';

export default (
  io: SocketIO.Server,
  socket: SocketIOContext,
  notification: Notification,
) => {
  notification.on(
    'personUpdated',
    (person: { previous: Person; current: Person }) =>
      sendToIntegration(io, socket, 'personUpdated', person),
  );
};
