import { Context } from 'koa';

export default function processPromoEnrollmentRequestController({
  processPromoEnrollmentRequest,
}: {
  processPromoEnrollmentRequest: (id: string) => Promise<boolean>;
}) {
  return async function putProcessPromoEnrollmentRequest(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        params: { id },
      } = httpRequest;
      const result = await processPromoEnrollmentRequest(id);

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
