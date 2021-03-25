import { VendorQueries } from '@dataAccess/vendors/vendors';
import { VendorValidationError } from '@entities/vendors/vendor';

export default function makeDeleteVendor(vendorsDB: VendorQueries) {
  return async function deleteVendor(id: string): Promise<any> {
    if (!id) {
      throw new VendorValidationError('ID must be provided.');
    }

    return vendorsDB.deleteVendor(id);
  };
}
