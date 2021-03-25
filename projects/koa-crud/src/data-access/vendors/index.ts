import VendorModel from '@models/vendor';

import vendorsQueries from './vendors';

const vendorsDB = vendorsQueries({ vendors: VendorModel });

export default vendorsDB;
