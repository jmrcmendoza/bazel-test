import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import { makeVendor } from '@entities/vendors';
import { VendorType } from '@models/vendor';

const chance = new Chance();

chai.use(chaiAsPromised);

describe('Entities - Vendor', () => {
  it('should throw an error for null vendor name', async () => {
    const data = {
      name: '',
      type: VendorType.Seamless,
    };

    await expect(makeVendor(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'VENDOR_VALIDATION_ERROR',
    );
    await expect(makeVendor(data)).to.eventually.rejectedWith(
      'Vendor name must be provided.',
    );
  });

  it('should throw an error for null vendor type', async () => {
    const data = {
      name: chance.name(),
      type: '',
    };

    await expect(makeVendor(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'VENDOR_VALIDATION_ERROR',
    );
    await expect(makeVendor(data)).to.eventually.rejectedWith(
      'Vendor type must be provided.',
    );
  });

  it('should return undefined', async () => {
    const data = {
      name: chance.name(),
      type: VendorType.Transfer,
    };

    await expect(makeVendor(data)).to.eventually.be.fulfilled;
  });
});
