import promosDB from '@dataAccess/promos';

import makeListPromos from './list-promos';
import makeSelectPromo from './select-promo';
import makeInsertPromo from './add-promo';
import makeUpdatePromo from './edit-promo';
import makeDeletePromo from './delete-promo';

export const listPromos = makeListPromos(promosDB);
export const selectPromo = makeSelectPromo(promosDB);
export const insertPromo = makeInsertPromo(promosDB);
export const updatePromo = makeUpdatePromo(promosDB);
export const deletePromo = makeDeletePromo(promosDB);
