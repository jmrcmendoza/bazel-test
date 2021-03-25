import R from 'ramda';
import { PromoQueries } from '@dataAccess/promos/promos';
import { PromoValidationError } from '@entities/promos/promo';

class PromoDeleteError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PROMO_STATUS_ERROR';
  }
}

export default function makeDeletePromo(promosDB: PromoQueries) {
  return async function deletePromo(id: string): Promise<any> {
    if (!id) {
      throw new PromoValidationError('ID must be provided.');
    }

    const promo = await promosDB.selectOnePromo(id);

    if (R.prop('status')(promo) === 'ACTIVE') {
      throw new PromoDeleteError('Cannot delete active promo.');
    }

    return promosDB.deletePromo(id);
  };
}
