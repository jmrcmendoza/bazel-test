import { Context } from 'koa';

export default function deleteMemberController({
  deleteMember,
}: {
  deleteMember: (id: string) => Promise<boolean>;
}) {
  return async function makeDeleteMember(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { id } = httpRequest.params;

      const result = await deleteMember(id);

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
