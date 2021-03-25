import { Context } from 'koa';
import { VendorDocument } from '@models/vendor';

export default function deleteVendorController({
  deleteVendor,
}: {
  deleteVendor: (id: string) => Promise<VendorDocument>;
}) {
  return async function makeDeleteVendor(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const { id } = httpRequest.params;

      const result = await deleteVendor(id);

      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
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
