import { authenticateMember } from '@useCases/authenticate';

import authenticateMemberController from './authenticate';

export const authMember = authenticateMemberController({ authenticateMember });
