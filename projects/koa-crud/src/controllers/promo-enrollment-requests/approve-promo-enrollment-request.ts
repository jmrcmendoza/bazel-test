import { Context } from 'koa';

export default function approvePromoEnrollmentRequestController({
  approvePromoEnrollmentRequest,
}: {
  approvePromoEnrollmentRequest: (id: string) => Promise<boolean>;
}) {
  return async function putApprovePromoEnrollmentRequest(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        params: { id },
      } = httpRequest;
      const result = await approvePromoEnrollmentRequest(id);

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
