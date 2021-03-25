import { Context } from 'koa';

export default function rejectPromoEnrollmentRequestController({
  rejectPromoEnrollmentRequest,
}: {
  rejectPromoEnrollmentRequest: (id: string) => Promise<boolean>;
}) {
  return async function putRejectPromoEnrollmentRequest(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        params: { id },
      } = httpRequest;
      const result = await rejectPromoEnrollmentRequest(id);

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
