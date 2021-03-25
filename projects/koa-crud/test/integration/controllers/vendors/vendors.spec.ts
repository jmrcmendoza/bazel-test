/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import R from 'ramda';
import server from '@server';
import { VendorType } from '@models/vendor';
import {
  delVendor,
  getOneVendor,
  getVendors,
  postVendor,
  putVendor,
} from '@controllers/vendors';
import { getLastData } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Vendor Controller', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Create Vendor', () => {
    context('Given incorrect values', () => {
      it('should return 400 status code for empty type', async () => {
        const data = {
          body: { name: chance.name(), type: '' },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        await expect(postVendor(data)).to.eventually.fulfilled.property(
          'status',
          400,
        );
      });

      it('should return 400 status code for empty name', async () => {
        const data = {
          body: { name: '', type: VendorType.Seamless },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        await expect(postVendor(data)).to.eventually.fulfilled.property(
          'status',
          400,
        );
      });
    });

    context('Given correct values', () => {
      it('should insert vendor and return 201 status code', async () => {
        const data = {
          body: { name: chance.name(), type: VendorType.Seamless },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        await expect(postVendor(data)).to.eventually.fulfilled.property(
          'status',
          201,
        );
      });
    });
  });

  describe('List Vendors', () => {
    it('should retrieve all vendors and return 200 status code', async () => {
      const data = {
        query: {},
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };

      const result = await getVendors(data);

      expect(result).property('status', 200);
      expect(result.body.totalCount).to.be.greaterThan(0);
    });

    it('should retrieve one vendors and return 200 status code', async () => {
      const data = {
        query: {},
        params: {},
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };

      const vendors = await getVendors(data);

      data.params = {
        id: R.compose(
          R.prop('_id'),
          R.prop('node'),
          R.last,
        )(vendors.body.edges),
      };

      await expect(getOneVendor(data)).to.eventually.fulfilled.property(
        'status',
        200,
      );
    });
  });

  describe('Edit Vendor', () => {
    context('Given incorrect values', async () => {
      it('should return 400 status code for empty type', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            type: VendorType.Seamless,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const vendors = await getVendors(data);

        const lastVendor = getLastData(vendors.body.edges);

        data.params = { id: lastVendor._id };
        data.body = {
          name: lastVendor.name,
          type: '',
        };

        await expect(putVendor(data)).to.eventually.fulfilled.property(
          'status',
          400,
        );
      });

      it('should return 400 status code for empty name', async () => {
        const data = {
          query: {},
          params: {},
          body: {},
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const vendors = await getVendors(data);

        const lastVendor = getLastData(vendors.body.edges);

        data.params = { id: lastVendor._id };
        data.body = {
          name: '',
          type: lastVendor.type,
        };

        await expect(putVendor(data)).to.eventually.fulfilled.property(
          'status',
          400,
        );
      });
    });

    context('Given correct values', () => {
      it('should update last vendor', async () => {
        const data = {
          query: {},
          params: {},
          body: {},
          headers: {
            'Content-Type': 'application/json',
            Referer: null,
            'User-Agent': null,
          },
        };

        const vendors = await getVendors(data);

        const lastVendor = getLastData(vendors.body.edges);

        data.params = { id: lastVendor._id };
        data.body = {
          name: lastVendor.name,
          type: VendorType.Transfer,
        };

        await expect(putVendor(data)).to.eventually.fulfilled.property(
          'status',
          200,
        );
      });
    });
  });

  describe('Delete Vendor', () => {
    it('should delete last vendor and return status code of 200', async () => {
      const data = {
        query: {},
        params: {},
        body: {},
        headers: {
          'Content-Type': 'application/json',
          Referer: null,
          'User-Agent': null,
        },
      };
      const vendors = await getVendors(data);

      data.params = {
        id: R.compose(
          R.prop('_id'),
          R.prop('node'),
          R.last,
        )(vendors.body.edges),
      };

      await expect(delVendor(data)).to.eventually.fulfilled.property(
        'status',
        200,
      );
    });
  });
});
