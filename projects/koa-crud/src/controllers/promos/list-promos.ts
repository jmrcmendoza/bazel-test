import { Context } from 'koa';
import { PromoDocument } from '@models/promo';

export default function listPromosController({
  listPromos,
}: {
  listPromos: (
    limit: number | null,
    cursor: string | null,
    filter: any,
  ) => Promise<PromoDocument>;
}) {
  return async function getListPromos(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        query: { limit, cursor, filter },
      } = httpRequest;

      const result = await listPromos(limit, cursor, filter);

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
