import { VendorDocument } from '@models/vendor';
import { makeVendor } from '@entities/vendors';
import { VendorQueries } from '@dataAccess/vendors/vendors';

export default function makeInsertVendor(vendorsDB: VendorQueries) {
  return async function insertVendor(vendorInfo: VendorDocument): Promise<any> {
    await makeVendor(vendorInfo);

    return vendorsDB.createVendor(vendorInfo);
  };
}
