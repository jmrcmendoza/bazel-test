import { ApplicationError } from '.';

export class InvalidInputError extends ApplicationError {
  constructor(message: string) {
    super('INVALID_INPUT_ERROR', message, 400);
  }
}
