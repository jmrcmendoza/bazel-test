import { ApplicationError } from '.';

export class ActionNotAllowError extends ApplicationError {
  constructor(message: string) {
    super('ACTION_NOT_ALLOWED', message, 400);
  }
}
