import { Context } from 'koa';
import { VendorDocument } from '@models/vendor';

export default function insertVendorController({
  insertVendor,
}: {
  insertVendor: (document: VendorDocument) => Promise<VendorDocument>;
}) {
  return async function postInsertVendor(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { body: vendorInfo } = httpRequest;
      const result = await insertVendor(vendorInfo);

      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 201,
        body: result,
      };
    } catch (e) {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: e.status ? e.status : 400,
        body: { errorMsg: e.message },
      };
    }
  };
}
