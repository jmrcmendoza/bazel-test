import { ApplicationError } from '.';

export class ContactNotFoundError extends ApplicationError {
  constructor(message: string) {
    super('CONTACT_NOT_FOUND', message, 400);
  }
}
