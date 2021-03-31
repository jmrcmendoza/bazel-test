import { ApplicationError } from '.';

export class IntegrationKeyNotFoundError extends ApplicationError {
  constructor(message: string) {
    super('INTEGRATION_KEY_NOT_FOUND', message, 401);
  }
}
