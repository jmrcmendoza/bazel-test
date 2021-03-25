import { VendorQueries } from '@dataAccess/vendors/vendors';
import { VendorValidationError } from '@entities/vendors/vendor';

export default function makeSelectVendor(vendorsDB: VendorQueries) {
  return async function selectVendor(id: string): Promise<any> {
    if (!id) {
      throw new VendorValidationError('ID must be provided.');
    }

    return vendorsDB.selectOneVendor(id);
  };
}
