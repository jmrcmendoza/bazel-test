import { MemberDocument } from '@models/member';

export class MemberValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MEMBER_VALIDATION_ERROR';
  }
}

export default function () {
  return async function makeVendor(
    member: MemberDocument,
  ): Promise<void | Error> {
    const { username, password } = member;

    if (!username) {
      throw new MemberValidationError('Username must be provided.');
    }

    if (!password) {
      throw new MemberValidationError('Password must be provided.');
    }
  };
}
