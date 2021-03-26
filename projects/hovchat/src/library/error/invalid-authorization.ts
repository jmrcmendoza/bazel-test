import { ApplicationError } from '.';

export class AuthorizationError extends ApplicationError {
  constructor(message: string) {
    super('AUTHORIZATION_ERROR', message, 401);
  }
}
