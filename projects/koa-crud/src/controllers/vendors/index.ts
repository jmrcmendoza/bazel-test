import {
  listVendors,
  selectVendor,
  insertVendor,
  updateVendor,
  deleteVendor,
} from '@useCases/vendors';

import listVendorsController from './list-vendors';
import selectVendorController from './select-vendor';
import insertVendorController from './add-vendor';
import updateVendorController from './edit-vendor';
import deleteVendorController from './delete-vendor';

export const getVendors = listVendorsController({ listVendors });
export const getOneVendor = selectVendorController({ selectVendor });
export const postVendor = insertVendorController({ insertVendor });
export const putVendor = updateVendorController({ updateVendor });
export const delVendor = deleteVendorController({ deleteVendor });
