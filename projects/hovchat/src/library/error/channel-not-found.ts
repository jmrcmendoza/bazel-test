import { ApplicationError } from '.';

export class ChannelNotFoundError extends ApplicationError {
  constructor(message: string) {
    super('CHANNEL_NOT_FOUND', message, 400);
  }
}
