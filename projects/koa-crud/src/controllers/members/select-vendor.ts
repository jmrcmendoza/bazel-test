import { Context } from 'koa';
import { MemberDocument } from '@models/member';

export default function selectMemberController({
  selectMember,
}: {
  selectMember: (id: string) => Promise<MemberDocument>;
}) {
  return async function getOneMember(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { id } = httpRequest.params;

      const result = await selectMember(id);

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
