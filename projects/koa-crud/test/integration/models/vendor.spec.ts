/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import VendorModel, { VendorType } from '@models/vendor';
import DBManager from '../tear-down';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Vendor Model', () => {
  before(async function () {
    this.dbManager = new DBManager();

    await this.dbManager.start();
  });

  describe('Create Vendor', () => {
    context('Given incorrect values', () => {
      it('should throw an error for empty type', async () => {
        const data = {
          name: chance.name(),
          type: '',
        };

        await expect(VendorModel.create(data)).to.eventually.rejectedWith(
          'Vendor validation failed: type: Path `type` is required.',
        );
      });

      it('should throw an error for empty name', async () => {
        const data = {
          name: '',
          type: VendorType.Seamless,
        };

        await expect(VendorModel.create(data)).to.eventually.rejectedWith(
          'Vendor validation failed: name: Path `name` is required.',
        );
      });

      it('should throw an error for invalid type', async () => {
        const data = {
          name: chance.name(),
          type: 'Test',
        };

        await expect(VendorModel.create(data)).to.eventually.rejected;
      });
    });

    context('Given correct values', () => {
      it('should insert', async () => {
        const data = {
          name: chance.name(),
          type: VendorType.Transfer,
        };

        const result = await VendorModel.create(data);

        expect(result).to.be.an('object');
        expect(result.name).to.equal(data.name);
      });
    });
  });

  describe('List Vendors', () => {
    it('should retrieve all vendors', async () => {
      const result = await VendorModel.find({}).lean();

      expect(result).to.be.an('array');
      expect(result).to.have.length.greaterThan(0);
    });

    it('should retrieve one vendor', async () => {
      const data = {
        name: chance.name(),
        type: VendorType.Seamless,
      };

      const vendor = await VendorModel.create(data);

      const result = await VendorModel.findById(vendor._id);

      expect(result).to.be.an('object');
      expect(result.name).to.equal(data.name);
    });
  });

  describe('Edit Vendor', () => {
    it('should update and return vendor values', async () => {
      const data = {
        name: chance.name(),
        type: VendorType.Seamless,
      };

      const vendor = await VendorModel.create(data);

      data.type = VendorType.Transfer;

      const result = await VendorModel.findByIdAndUpdate(vendor._id, data, {
        useFindAndModify: false,
      });

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });

  describe('Delete Vendor', () => {
    it('should create and delete vendor', async () => {
      const data = {
        name: chance.name(),
        type: VendorType.Seamless,
      };

      const vendor = await VendorModel.create(data);

      const result = await VendorModel.findByIdAndDelete(vendor._id);

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });
});
