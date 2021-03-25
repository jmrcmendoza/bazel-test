import { Context } from 'koa';
import { MemberDocument } from '@models/member';

export default function updateMemberController({
  updateMember,
}: {
  updateMember: (id: string, document: MemberDocument) => Promise<boolean>;
}) {
  return async function postInsertMember(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        params: { id },
        body: memberInfo,
      } = httpRequest;

      const result = await updateMember(id, memberInfo);

      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
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
