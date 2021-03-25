import { MemberDocument } from '@models/member';
import { makeMember } from '@entities/members';
import { MemberQueries } from '@dataAccess/members/members';
import { MemberValidationError } from '@entities/members/member';

export default function makeUpdateMember(membersDB: MemberQueries) {
  return async function updateMember(
    id: string,
    memberInfo: MemberDocument,
  ): Promise<boolean> {
    await makeMember(memberInfo);

    if (!id) {
      throw new MemberValidationError('ID must be provided.');
    }

    return membersDB.updateMember(id, memberInfo);
  };
}
