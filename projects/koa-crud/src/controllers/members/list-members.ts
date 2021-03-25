import { Context } from 'koa';
import { MemberDocument } from '@models/member';

export default function listMembersController({
  listMembers,
}: {
  listMembers: (
    limit: number | null,
    cursor: string | null,
    filter: any,
  ) => Promise<MemberDocument>;
}) {
  return async function getListMembers(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        query: { limit, cursor, filter },
      } = httpRequest;

      const result = await listMembers(limit, cursor, filter);

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
