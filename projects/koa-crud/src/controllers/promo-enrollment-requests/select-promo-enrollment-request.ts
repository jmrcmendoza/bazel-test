import { Context } from 'koa';
import { PromoEnrollmentRequestDocument } from '@models/promo-enrollment-requests';

export default function selectPromoEnrollmentRequestController({
  selectOnePromoEnrollmentRequest,
}: {
  selectOnePromoEnrollmentRequest: (
    id: string,
  ) => Promise<PromoEnrollmentRequestDocument>;
}) {
  return async function getOnePromoEnrollmentRequest(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        params: { id },
      } = httpRequest;

      const result = await selectOnePromoEnrollmentRequest(id);

      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 201,
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
