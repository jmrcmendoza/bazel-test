import { VendorDocument } from '@models/vendor';
import { makeVendor } from '@entities/vendors';
import { VendorQueries } from '@dataAccess/vendors/vendors';
import { VendorValidationError } from '@entities/vendors/vendor';

export default function makeUpdateVendor(vendorsDB: VendorQueries) {
  return async function updateVendor(
    id: string,
    vendorInfo: VendorDocument,
  ): Promise<boolean> {
    await makeVendor(vendorInfo);

    if (!id) {
      throw new VendorValidationError('ID must be provided.');
    }

    return vendorsDB.updateVendor(id, vendorInfo);
  };
}
