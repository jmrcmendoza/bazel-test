import { VendorQueries } from '@dataAccess/vendors/vendors';

export default function makeListVendors(vendorsDB: VendorQueries) {
  return async function listVendors(
    limit: number | null,
    cursor: string | null,
    filter: string | null,
  ): Promise<any> {
    return vendorsDB.listVendors(limit, cursor, filter);
  };
}
