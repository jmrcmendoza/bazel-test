import promoEnrollmentRequestsDB from '@dataAccess/promo-enrollment-requests';
import promosDB from '@dataAccess/promos';
import membersDB from '@dataAccess/members';

import makeListPromoEnrollmentRequests from './list-promo-enrollment-requests';
import makeSelectPromoEnrollmentRequest from './select-promo-enrollment-request';
import makeEnrollToPromo from './enroll-to-promo';
import makeProcessPromoEnrollmentRequest from './process-promo-enrollment-request';
import makeApprovePromoEnrollmentRequest from './approve-promo-enrollment-request';
import makeRejectPromoEnrollmentRequest from './reject-promo-enrollment-request';

export const listPromoEnrollmentRequests = makeListPromoEnrollmentRequests(
  promoEnrollmentRequestsDB,
);
export const selectOnePromoEnrollmentRequest = makeSelectPromoEnrollmentRequest(
  promoEnrollmentRequestsDB,
);
export const enrollToPromo = makeEnrollToPromo({
  promoEnrollmentRequestsDB,
  promosDB,
  membersDB,
});
export const processPromoEnrollmentRequest = makeProcessPromoEnrollmentRequest(
  promoEnrollmentRequestsDB,
);
export const approvePromoEnrollmentRequest = makeApprovePromoEnrollmentRequest(
  promoEnrollmentRequestsDB,
);
export const rejectPromoEnrollmentRequest = makeRejectPromoEnrollmentRequest(
  promoEnrollmentRequestsDB,
);
