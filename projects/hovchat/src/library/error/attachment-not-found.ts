import { ApplicationError } from '.';

export class AttachmentNotFoundError extends ApplicationError {
  constructor(message: string) {
    super('ATTACHMENT_NOT_FOUND', message, 400);
  }
}
