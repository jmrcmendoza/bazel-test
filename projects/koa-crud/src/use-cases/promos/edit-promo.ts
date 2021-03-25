import { PromoDocument } from '@models/promo';
import { makePromo } from '@entities/promos';
import { PromoQueries } from '@dataAccess/promos/promos';
import { PromoValidationError } from '@entities/promos/promo';

export default function makeUpdatePromo(promosDB: PromoQueries) {
  return async function updatePromo(
    id: string,
    promoInfo: PromoDocument,
  ): Promise<boolean> {
    await makePromo(promoInfo);

    if (!id) {
      throw new PromoValidationError('ID must be provided.');
    }

    return promosDB.updatePromo(id, promoInfo);
  };
}
