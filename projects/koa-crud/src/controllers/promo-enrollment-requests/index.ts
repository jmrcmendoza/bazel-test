import {
  listPromoEnrollmentRequests,
  selectOnePromoEnrollmentRequest,
  enrollToPromo,
  processPromoEnrollmentRequest,
  approvePromoEnrollmentRequest,
  rejectPromoEnrollmentRequest,
} from '@useCases/promo-enrollment-requests';

import listPromoEnrollmentRequestsController from './list-promo-enrollment-requests';
import selectOnePromoEnrollmentRequestController from './select-promo-enrollment-request';
import enrollToPromoController from './enroll-to-promo';
import processPromoEnrollmentRequestController from './process-promo-enrollment-request';
import approvePromoEnrollmentRequestController from './approve-promo-enrollment-request';
import rejectPromoEnrollmentRequestController from './reject-promo-enrollment-request';

export const getPromoEnrollmentRequests = listPromoEnrollmentRequestsController(
  { listPromoEnrollmentRequests },
);
export const getOnePromoEnrollmentRequest = selectOnePromoEnrollmentRequestController(
  { selectOnePromoEnrollmentRequest },
);
export const postEnrollToPromo = enrollToPromoController({ enrollToPromo });
export const putProcessPromoEnrollmentRequest = processPromoEnrollmentRequestController(
  { processPromoEnrollmentRequest },
);
export const putApprovePromoEnrollmentRequest = approvePromoEnrollmentRequestController(
  { approvePromoEnrollmentRequest },
);
export const putRejectPromoEnrollmentRequest = rejectPromoEnrollmentRequestController(
  { rejectPromoEnrollmentRequest },
);
