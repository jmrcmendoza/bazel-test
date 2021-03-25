import { Context } from 'koa';
import { PromoDocument } from '@models/promo';

export default function updatePromoController({
  updatePromo,
}: {
  updatePromo: (id: string, document: PromoDocument) => Promise<boolean>;
}) {
  return async function postInsertPromo(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        params: { id },
        body: promoInfo,
      } = httpRequest;

      const result = await updatePromo(id, promoInfo);

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
