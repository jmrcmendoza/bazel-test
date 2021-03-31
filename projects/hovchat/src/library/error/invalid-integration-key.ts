import { ApplicationError } from '.';

export class InvalidIntegrationKeyError extends ApplicationError {
  constructor(message: string) {
    super('INVALID_INTEGRATION_KEY_ERROR', message, 401);
  }
}
