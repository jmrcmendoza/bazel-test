import MemberModel from '@models/member';

import memberQueries from './members';

const memberDB = memberQueries({ member: MemberModel });

export default memberDB;
