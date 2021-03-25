import { Context } from 'koa';
import { PromoDocument } from '@models/promo';

export default function insertPromoController({
  insertPromo,
}: {
  insertPromo: (document: PromoDocument) => Promise<boolean>;
}) {
  return async function postInsertPromo(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { body: promoInfo } = httpRequest;
      const result = await insertPromo(promoInfo);

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
