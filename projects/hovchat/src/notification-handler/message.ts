import SocketIO from 'socket.io';
import Notification from 'src/notification/notification';
import { Message } from 'src/types/common';
import { SocketIOContext } from 'src/types/context';
import { NotificationEvents } from 'src/types/notification';
import sendToCurrentChannel from './utilities/send-to-current-channel';

export default (
  io: SocketIO.Server,
  socket: SocketIOContext,
  notification: Notification,
) => {
  ([
    'messageCreated',
    'messageDeleted',
    'messageUpdated',
  ] as (keyof NotificationEvents)[]).forEach((event) =>
    notification.on(event, (message: Message) =>
      sendToCurrentChannel(io, socket, event, message),
    ),
  );
};
