import { Context } from 'koa';
import { MemberDocument } from '@models/member';

export default function insertMemberController({
  insertMember,
}: {
  insertMember: (document: MemberDocument) => Promise<boolean>;
}) {
  return async function postInsertMember(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { body: memberInfo } = httpRequest;
      const result = await insertMember(memberInfo);

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
