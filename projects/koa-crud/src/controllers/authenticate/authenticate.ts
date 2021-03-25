import { Context } from 'koa';
import { MemberDocument } from '@models/member';

export default function authenticateMemberController({
  authenticateMember,
}: {
  authenticateMember: (document: MemberDocument) => Promise<{ token: string }>;
}) {
  return async function authMember(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { body: memberInfo } = httpRequest;
      const result = await authenticateMember(memberInfo);

      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 201,
        body: result,
      };
    } catch (e) {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: e.status ? e.status : 400,
        body: { errorMsg: e.message },
      };
    }
  };
}
