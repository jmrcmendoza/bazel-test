import { MemberQueries } from '@dataAccess/members/members';
import { MemberValidationError } from '@entities/members/member';

export default function makeDeleteMember(membersDB: MemberQueries) {
  return async function deleteMember(id: string): Promise<any> {
    if (!id) {
      throw new MemberValidationError('ID must be provided.');
    }

    return membersDB.deleteMember(id);
  };
}
