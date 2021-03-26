import { ApplicationError } from '.';

export class MessageNotFoundError extends ApplicationError {
  constructor(message: string) {
    super('MESSAGE_NOT_FOUND', message, 400);
  }
}
