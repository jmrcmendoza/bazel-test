import Router from 'koa-router';

import { authMember } from '@controllers/authenticate';

import { serialize } from '@serialize';

const router = new Router();

router.post('/api/authenticate', serialize(authMember));

export default router;
