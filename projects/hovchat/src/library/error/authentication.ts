import { ApplicationError } from '.';

export default class AuthenticationError extends ApplicationError {
  public constructor() {
    super(
      'AUTHENTICATION_ERROR',
      'No authentication found on the header or invalid token.',
      400,
    );
  }
}
