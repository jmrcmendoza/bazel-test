import { MemberDocument } from '@models/member';
import { makeMember } from '@entities/members';
import { MemberQueries } from '@dataAccess/members/members';
import { createToken } from '@middlewares/authorization';

class AuthenticateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AUTHENTICATE_ERROR';
  }
}

export default function makeAuthenticateMember(membersDB: MemberQueries) {
  return async function authenticateMember(
    memberInfo: MemberDocument,
  ): Promise<{ token: string }> {
    await makeMember(memberInfo);

    const result = await membersDB.authenticateMember(memberInfo);

    if (result.verified) {
      const token = await createToken(result.id);

      return { token };
    }

    throw new AuthenticateError('Authenticate failed.');
  };
}
