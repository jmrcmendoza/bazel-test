import Router from 'koa-router';

import {
  getMembers,
  getOneMember,
  postMember,
  putMember,
  delMember,
} from '@controllers/members';

import { serialize } from '@serialize';

const router = new Router();

router.get('/api/members', serialize(getMembers));
router.get('/api/members/:id', serialize(getOneMember));
router.post('/api/members', serialize(postMember));
router.put('/api/members/:id', serialize(putMember));
router.delete('/api/members/:id', serialize(delMember));

export default router;
