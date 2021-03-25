import { PromoQueries } from '@dataAccess/promos/promos';
import { PromoValidationError } from '@entities/promos/promo';

export default function makeSelectPromo(promosDB: PromoQueries) {
  return async function selectPromo(id: string): Promise<any> {
    if (!id) {
      throw new PromoValidationError('ID must be provided.');
    }

    return promosDB.selectOnePromo(id);
  };
}
