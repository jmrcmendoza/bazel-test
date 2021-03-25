import { Context } from 'koa';
import { PromoEnrollmentRequestDocument } from '@models/promo-enrollment-requests';

export default function listPromoEnrollmentRequestsController({
  listPromoEnrollmentRequests,
}: {
  listPromoEnrollmentRequests: (
    limit: number | null,
    cursor: string | null,
    filter: any,
  ) => Promise<PromoEnrollmentRequestDocument>;
}) {
  return async function getListPromoEnrollmentRequests(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        query: { limit, cursor, filter },
      } = httpRequest;

      const result = await listPromoEnrollmentRequests(limit, cursor, filter);

      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
        body: result,
      };
    } catch (e) {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: e.status ? e.status : 400,
        body: { errorMsg: e.message },
      };
    }
  };
}
