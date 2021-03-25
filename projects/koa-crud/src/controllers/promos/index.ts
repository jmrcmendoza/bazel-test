import {
  listPromos,
  selectPromo,
  insertPromo,
  updatePromo,
  deletePromo,
} from '@useCases/promos';

import listPromosController from './list-promos';
import selectPromoController from './select-promo';
import insertPromoController from './add-promo';
import updatePromoController from './edit-promo';
import deletePromoController from './delete-promo';

export const getPromos = listPromosController({ listPromos });
export const getOnePromo = selectPromoController({ selectPromo });
export const postPromo = insertPromoController({ insertPromo });
export const putPromo = updatePromoController({ updatePromo });
export const delPromo = deletePromoController({ deletePromo });
