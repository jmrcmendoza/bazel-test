/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import R from 'ramda';
import server from '@server';
import promoDB from '@dataAccess/promos';
import { PromoStatus, PromoTemplate } from '@models/promo';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Promo Data Access', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Create a Promo', async () => {
    context('Given values are incorrect', () => {
      it('should throw a validation error for empty name', async () => {
        const data = {
          name: '',
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(promoDB.createPromo(data)).to.eventually.rejected;
      });

      it('should throw a validation error for empty template', async () => {
        const data = {
          name: chance.name(),
          template: '',
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(promoDB.createPromo(data)).to.eventually.rejected;
      });

      it('should throw a validation error for invalid template', async () => {
        const data = {
          name: chance.name(),
          template: 'Test',
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(promoDB.createPromo(data)).to.eventually.rejected;
      });

      it('should throw a validation error for empty title', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: '',
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(promoDB.createPromo(data)).to.eventually.rejected;
      });

      it('should throw a validation error for empty description', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: '',
          minimumBalance: chance.prime(),
        };

        await expect(promoDB.createPromo(data)).to.eventually.rejected;
      });
    });

    context('Given the values are correct', () => {
      it('should insert promo return true', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        const result = await promoDB.createPromo(data);

        expect(result).to.be.true;
      });
    });
  });

  describe('List Promos', () => {
    it('should retrieve all promos', async () => {
      const result = await promoDB.listPromos();

      expect(result.edges).to.be.an('array');
      expect(result.totalCount).to.be.greaterThan(0);
    });

    it('should retrieve one promo', async () => {
      const promos = await promoDB.listPromos();

      const lastPromo = R.compose(R.prop('node'), R.last)(promos.edges);

      const result = await promoDB.selectOnePromo(lastPromo.id);

      expect(result).to.exist;
      expect(result).to.be.an('object');
      expect(result).to.have.property('name', lastPromo.name);
    });
  });

  describe('Update Promo', () => {
    context('Given incorrect values', () => {
      it('should update promo type', async () => {
        const vendors = await promoDB.listPromos();

        const lastVendor = R.compose(R.prop('node'), R.last)(vendors.edges);

        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const result = await promoDB.updatePromo(lastVendor._id, data);

        expect(result).to.be.true;
      });
    });
  });

  describe('Delete Promo', () => {
    it('should delete one promo', async () => {
      const vendors = await promoDB.listPromos();

      const lastVendorId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(vendors.edges);

      const result = await promoDB.deletePromo(lastVendorId);

      expect(result).to.exist;
      expect(result).to.be.true;
    });
  });
});
