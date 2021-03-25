import { MemberDocument } from '@models/member';
import { makeMember } from '@entities/members';
import { MemberQueries } from '@dataAccess/members/members';

export default function makeInsertMember(membersDB: MemberQueries) {
  return async function insertMember(
    memberInfo: MemberDocument,
  ): Promise<boolean> {
    await makeMember(memberInfo);

    return membersDB.createMember(memberInfo);
  };
}
