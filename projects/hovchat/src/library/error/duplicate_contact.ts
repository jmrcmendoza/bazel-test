import { ApplicationError } from '.';

export class DuplicateContactError extends ApplicationError {
  constructor(message: string) {
    super('DUPLICATE_CONTACT', message, 400);
  }
}
