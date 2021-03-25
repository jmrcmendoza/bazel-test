import { Context } from 'koa';
import { VendorDocument } from '@models/vendor';

export default function listVendorsController({
  listVendors,
}: {
  listVendors: (
    limit: number | null,
    cursor: string | null,
    filter: string | null,
  ) => Promise<VendorDocument>;
}) {
  return async function getListVendors(
    httpRequest: Context,
  ): Promise<Record<string, any>> {
    try {
      const {
        query: { limit, cursor, filter },
      } = httpRequest;

      const result = await listVendors(limit, cursor, filter);

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
