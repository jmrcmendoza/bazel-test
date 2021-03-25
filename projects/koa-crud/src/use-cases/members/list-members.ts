import { MemberQueries } from '@dataAccess/members/members';

export default function makeListMembers(membersDB: MemberQueries) {
  return async function listMembers(
    limit: number | null,
    cursor: string | null,
    filter: any,
  ): Promise<any> {
    return membersDB.listMembers(limit, cursor, filter);
  };
}
