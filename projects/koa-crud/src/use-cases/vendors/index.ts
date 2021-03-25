import vendorsDB from '@dataAccess/vendors';

import makeListVendors from './list-vendors';
import makeSelectVendor from './select-vendor';
import makeInsertVendor from './add-vendor';
import makeUpdateVendor from './edit-vendor';
import makeDeleteVendor from './delete-vendor';

export const listVendors = makeListVendors(vendorsDB);
export const selectVendor = makeSelectVendor(vendorsDB);
export const insertVendor = makeInsertVendor(vendorsDB);
export const updateVendor = makeUpdateVendor(vendorsDB);
export const deleteVendor = makeDeleteVendor(vendorsDB);
