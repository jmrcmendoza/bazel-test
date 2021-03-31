import { ApplicationError } from '.';

export class PersonNotFoundError extends ApplicationError {
  constructor(message: string) {
    super('PERSON_NOT_FOUND', message, 400);
  }
}
