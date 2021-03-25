import { VendorDocument } from '@models/vendor';

export class VendorValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VENDOR_VALIDATION_ERROR';
  }
}

export default function () {
  return async function makeVendor(
    vendor: VendorDocument,
  ): Promise<void | Error> {
    const { name, type } = vendor;

    if (!name) {
      throw new VendorValidationError('Vendor name must be provided.');
    }

    if (!type) {
      throw new VendorValidationError('Vendor type must be provided.');
    }
  };
}
