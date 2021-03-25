import PromoEnrollmentRequestModel from '@models/promo-enrollment-requests';

import promoEnrollmentRequestQueries from './promo-enrollment-requests';

const promoEnrollmentRequestsDB = promoEnrollmentRequestQueries({
  promoEnrollmentRequests: PromoEnrollmentRequestModel,
});

export default promoEnrollmentRequestsDB;
