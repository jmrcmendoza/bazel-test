import SocketIO from 'socket.io';
import { SocketIOContext } from 'src/types/context';
import { NotificationEvents } from 'src/types/notification';
import Logger from 'src/library/logger';

const logger = Logger.tag(['socket.io', 'emit']);

export default (
  io: SocketIO.Server,
  socket: SocketIOContext,
  type: keyof NotificationEvents,
  data: any,
) => {
  logger.verbose({ ...socket.state, type, data });
  io.to(socket.state.integration).emit(type, data);
};
