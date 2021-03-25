import { Connection, paginate } from '@helpers/pagination';
import PromoEnrollmentRequestModel, {
  PromoEnrollmentRequestDocument,
  PromoEnrollmentRequestStatus,
} from '@models/promo-enrollment-requests';
import { _FilterQuery } from 'mongoose';

export type PromoEnrollmentRequestQueries = {
  listPromoEnrollmentRequests: (
    limit: number | null,
    cursor: string | null,
    filter: string | null,
  ) => Promise<Connection<Record<string, any>>>;
  selectOnePromoEnrollmentRequest: (
    id: string,
  ) => Promise<PromoEnrollmentRequestDocument>;
  enrollToPromo: (document: PromoEnrollmentRequestDocument) => Promise<boolean>;
  processPromoEnrollmentRequest: (id: string) => Promise<boolean>;
  approvePromoEnrollmentRequest: (id: string) => Promise<boolean>;
  rejectPromoEnrollmentRequest: (id: string) => Promise<boolean>;
};

export default function ({
  promoEnrollmentRequests,
}: {
  promoEnrollmentRequests: typeof PromoEnrollmentRequestModel;
}): PromoEnrollmentRequestQueries {
  return Object.freeze({
    listPromoEnrollmentRequests(
      limit: number | null,
      cursor: string | null,
      filter: string | null,
    ) {
      return paginate(promoEnrollmentRequests, limit, cursor, null, filter);
    },
    selectOnePromoEnrollmentRequest(id: string) {
      return promoEnrollmentRequests
        .findById(id)
        .populate('promo')
        .populate({ path: 'member', select: '-password' })
        .lean({ virtuals: true });
    },
    async enrollToPromo(enrollmentInfo) {
      const result = await promoEnrollmentRequests.create(enrollmentInfo);

      return !!result;
    },
    async processPromoEnrollmentRequest(id: string) {
      const result = await promoEnrollmentRequests.findByIdAndUpdate(
        id,
        { status: PromoEnrollmentRequestStatus.Processing },
        {
          useFindAndModify: false,
        },
      );

      return !!result;
    },
    async approvePromoEnrollmentRequest(id: string) {
      const result = await promoEnrollmentRequests.findByIdAndUpdate(
        id,
        { status: PromoEnrollmentRequestStatus.Approved },
        {
          useFindAndModify: false,
        },
      );

      return !!result;
    },
    async rejectPromoEnrollmentRequest(id: string) {
      const result = await promoEnrollmentRequests.findByIdAndUpdate(
        id,
        { status: PromoEnrollmentRequestStatus.Rejected },
        {
          useFindAndModify: false,
        },
      );

      return !!result;
    },
  });
}
