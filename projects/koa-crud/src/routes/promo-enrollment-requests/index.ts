import Router from 'koa-router';

import {
  getPromoEnrollmentRequests,
  getOnePromoEnrollmentRequest,
  postEnrollToPromo,
  putProcessPromoEnrollmentRequest,
  putApprovePromoEnrollmentRequest,
  putRejectPromoEnrollmentRequest,
} from '@controllers/promo-enrollment-requests';

import { serialize } from '@serialize';

const router = new Router();

router.get(
  '/api/promos/enrollment/requests',
  serialize(getPromoEnrollmentRequests),
);
router.get(
  '/api/promos/enrollment/requests/:id',
  serialize(getOnePromoEnrollmentRequest),
);
router.post(
  '/api/promos/enrollment/requests/:promo',
  serialize(postEnrollToPromo),
);
router.put(
  '/api/promos/enrollment/requests/process/:id',
  serialize(putProcessPromoEnrollmentRequest),
);
router.put(
  '/api/promos/enrollment/requests/approve/:id',
  serialize(putApprovePromoEnrollmentRequest),
);
router.put(
  '/api/promos/enrollment/requests/reject/:id',
  serialize(putRejectPromoEnrollmentRequest),
);

export default router;
