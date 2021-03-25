import { MemberQueries } from '@dataAccess/members/members';
import { MemberValidationError } from '@entities/members/member';

export default function makeSelectMember(membersDB: MemberQueries) {
  return async function selectMember(id: string): Promise<any> {
    if (!id) {
      throw new MemberValidationError('ID must be provided.');
    }

    return membersDB.selectOneMember(id);
  };
}
