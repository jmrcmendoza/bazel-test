import PromoModel from '@models/promo';

import promoQueries from './promos';

const promoDB = promoQueries({ promo: PromoModel });

export default promoDB;
