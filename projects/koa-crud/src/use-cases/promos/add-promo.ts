import { PromoDocument } from '@models/promo';
import { makePromo } from '@entities/promos';
import { PromoQueries } from '@dataAccess/promos/promos';

export default function makeInsertPromo(promosDB: PromoQueries) {
  return async function insertPromo(promoInfo: PromoDocument): Promise<any> {
    await makePromo(promoInfo);

    return promosDB.createPromo(promoInfo);
  };
}
