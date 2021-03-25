import membersDB from '@dataAccess/members';

import makeAuthenticateMember from './authenticate';

export const authenticateMember = makeAuthenticateMember(membersDB);
