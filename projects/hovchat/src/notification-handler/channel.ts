import SocketIO from 'socket.io';
import { ApplicationError } from 'src/library/error';
import { ChannelNotFoundError } from 'src/library/error/channel-not-found';

import Model from 'src/model';
import Logger from 'src/library/logger';
import Notification from 'src/notification/notification';
import { Channel, ID } from 'src/types/common';
import { SocketIOContext } from 'src/types/context';
import sendToCurrentChannel from './utilities/send-to-current-channel';

const logger = Logger.tag(['socket.io', 'channel']);

export default (
  io: SocketIO.Server,
  socket: SocketIOContext,
  notification: Notification,
) => {
  notification.on('channelDeleted', (channel: Channel) => {
    logger.tag('channelDeleted').verbose(channel);

    sendToCurrentChannel(io, socket, 'channelDeleted', channel);

    socket.leave(channel.id);
    logger
      .tag(['channelDeleted', 'personLeftRoom'])
      .verbose({ channel: channel.id, person: socket.state.person });
  });

  notification.on('channelUpdated', (channel: Channel) => {
    logger.tag('channelUpdated').verbose(channel);
    sendToCurrentChannel(io, socket, 'channelUpdated', channel);

    if (!channel.persons.includes(socket.state.person)) {
      socket.leave(channel.id);
      logger
        .tag(['channelDeleted', 'personLeftRoom'])
        .verbose({ channel: channel.id, person: socket.state.person });
    }
  });

  socket.on('subscribe', async (channelId: ID, cb) => {
    const channel = await Model.Channel.findById(channelId);
    if (!channel || !channel.persons.includes(socket.state.person)) {
      cb(
        ApplicationError.toSocketError(
          new ChannelNotFoundError('Channel not found.'),
        ),
      );
      return;
    }

    if (socket.state.channel) {
      socket.leave(socket.state.channel);
      logger
        .tag(['subscribe', 'personLeftRoom'])
        .verbose({ channel: channel.id, person: socket.state.person });
    }

    socket.join(channelId);

    logger
      .tag(['subscribe', 'personJoinRoom'])
      .verbose({ channel: channel.id, person: socket.state.person });
    // eslint-disable-next-line no-param-reassign
    socket.state.channel = channelId;
    cb({ ok: true });
  });

  socket.on('unsubscribe', (channelId: ID, cb) => {
    if (socket.state.channel && socket.state.channel === channelId) {
      socket.leave(channelId);
      cb({ ok: true });
      return;
    }

    cb({ ok: false });
  });
};
