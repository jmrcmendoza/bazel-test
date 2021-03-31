import { ApplicationError } from '.';

export class UploadError extends ApplicationError {
  constructor(message: string) {
    super('UPLOAD_ERROR', message, 400);
  }
}
