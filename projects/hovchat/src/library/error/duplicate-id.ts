import { ApplicationError } from '.';

export class DuplicateIdError extends ApplicationError {
  constructor(message: string) {
    super('DUPLICATE_ID_ERROR', message, 400);
  }
}
