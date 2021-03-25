import { Context } from 'koa';
import { PromoDocument } from '@models/promo';

export default function selectPromoController({
  selectPromo,
}: {
  selectPromo: (id: string) => Promise<PromoDocument>;
}) {
  return async function getOnePromo(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { id } = httpRequest.params;

      const result = await selectPromo(id);

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
