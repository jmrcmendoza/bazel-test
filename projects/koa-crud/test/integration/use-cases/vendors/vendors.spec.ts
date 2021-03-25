/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import R from 'ramda';
import Chance from 'chance';
import server from '@server';

import {
  deleteVendor,
  insertVendor,
  listVendors,
  selectVendor,
  updateVendor,
} from '@useCases/vendors';
import VendorModel, { VendorType } from '@models/vendor';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Vendor Use Case', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  after(async function () {
    await VendorModel.deleteMany({});
  });

  describe('Add Vendor', () => {
    context('Given incorrect values', () => {
      it('should throw an error for null vendor name', async () => {
        const data = {
          name: '',
          type: VendorType.Seamless,
        };

        await expect(
          insertVendor(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'VENDOR_VALIDATION_ERROR',
        );
        await expect(insertVendor(data)).to.eventually.rejectedWith(
          'Vendor name must be provided.',
        );
      });

      it('should throw an error for null vendor type', async () => {
        const data = {
          name: chance.name(),
          type: '',
        };

        await expect(
          insertVendor(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'VENDOR_VALIDATION_ERROR',
        );

        await expect(insertVendor(data)).to.eventually.rejectedWith(
          'Vendor type must be provided.',
        );
      });
    });

    context('Given correct values', () => {
      it('should insert and return vendor values', async () => {
        const data = {
          name: chance.name(),
          type: VendorType.Transfer,
        };

        const result = await insertVendor(data);

        expect(result).to.exist;
        expect(result).to.be.true;
      });
    });
  });

  describe('List Vendors', () => {
    it('should return all vendors', async () => {
      const result = await listVendors();

      expect(result).to.exist;
      expect(result.edges).to.be.an('array');
      expect(result.totalCount).to.be.greaterThan(0);
    });

    it('should return one vendors', async () => {
      const vendors = await listVendors();

      const lastVendorId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(vendors.edges);

      const result = await selectVendor(lastVendorId);

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });

  describe('Edit Vendor', () => {
    before(async function () {
      this.vendor = await VendorModel.create({
        name: chance.name(),
        type: VendorType.Transfer,
      });
    });

    context('Given invalid values', () => {
      it('should throw an error for null vendor name', async function () {
        const data = {
          name: '',
          type: this.vendor.type,
        };

        await expect(
          updateVendor(this.vendor.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'VENDOR_VALIDATION_ERROR',
        );
        await expect(
          updateVendor(this.vendor.id, data),
        ).to.eventually.rejectedWith('Vendor name must be provided.');
      });

      it('should throw an error for null vendor type', async function () {
        const data = {
          name: this.vendor.name,
          type: '',
        };

        await expect(
          updateVendor(this.vendor.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'VENDOR_VALIDATION_ERROR',
        );
        await expect(
          updateVendor(this.vendor.id, data),
        ).to.eventually.rejectedWith('Vendor type must be provided.');
      });
    });
  });

  describe('Delete Vendor', () => {
    before(async function () {
      this.vendor = await VendorModel.create({
        name: chance.name(),
        type: VendorType.Transfer,
      });
    });

    context('Given correct values', () => {
      it('should delete one vendor', async function () {
        await expect(deleteVendor(this.vendor.id)).to.be.eventually.true;
      });
    });
  });
});
