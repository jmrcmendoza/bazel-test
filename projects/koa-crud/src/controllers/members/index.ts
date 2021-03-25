import {
  listMembers,
  selectMember,
  insertMember,
  updateMember,
  deleteMember,
} from '@useCases/members';

import listMembersController from './list-members';
import selectMemberController from './select-vendor';
import insertMemberController from './add-member';
import updateMemberController from './edit-member';
import deleteMemberController from './delete-member';

export const getMembers = listMembersController({ listMembers });
export const getOneMember = selectMemberController({ selectMember });
export const postMember = insertMemberController({ insertMember });
export const putMember = updateMemberController({ updateMember });
export const delMember = deleteMemberController({ deleteMember });
