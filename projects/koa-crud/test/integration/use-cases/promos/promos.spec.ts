/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import R from 'ramda';
import Chance from 'chance';
import server from '@server';
import {
  deletePromo,
  insertPromo,
  listPromos,
  selectPromo,
  updatePromo,
} from '@useCases/promos';
import PromoModel, {
  MemberFields,
  PromoStatus,
  PromoTemplate,
} from '@models/promo';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Promo Use Case', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Add Promo', () => {
    context('Given incorrect values', () => {
      it('should throw an error for empty name', async () => {
        const data = {
          name: '',
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Promo name must be provided.',
        );
      });

      it('should throw an error for empty template', async () => {
        const data = {
          name: chance.name(),
          template: '',
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Template must be provided.',
        );
      });

      it('should throw an error for invalid template', async () => {
        const data = {
          name: chance.name(),
          template: 'Test',
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'INVALID_PROMO_TYPE',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Invalid template.',
        );
      });

      it('should throw an error for empty title', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: '',
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Promo title must be provided',
        );
      });

      it('should throw an error for empty description', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: '',
          minimumBalance: chance.prime(),
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Description must be provided.',
        );
      });

      it('should throw an error for empty minimum balance given template is deposit', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: null,
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Minimum balance must be provided.',
        );
      });

      it('should throw an error for empty promo fields given template is sign up', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: [],
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Members fields must be provided.',
        );
      });

      it('should throw an error for invalid promo fields given template is sign up', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: ['Test'],
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'INVALID_MEMBER_FIELD',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Test is an invalid field.',
        );
      });

      it('should throw an error for invalid status', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: [MemberFields.REAL_NAME],
          status: 'Test',
        };

        await expect(
          insertPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'INVALID_PROMO_STATUS',
        );
        await expect(insertPromo(data)).to.eventually.rejectedWith(
          'Invalid status.',
        );
      });
    });

    context('Given correct values', () => {
      it('should insert promo', async () => {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        const result = await insertPromo(data);

        expect(result).to.exist;
        expect(result).to.be.true;
      });
    });
  });

  describe('List Promos', () => {
    it('should return all promos', async () => {
      const result = await listPromos();

      expect(result).to.exist;
      expect(result.edges).to.be.an('array');
      expect(result.totalCount).to.be.greaterThan(0);
    });

    it('should return one promo', async () => {
      const promo = await listPromos();

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promo.edges);

      const result = await selectPromo(lastPromoId);

      expect(result).to.exist;
      expect(result).to.be.an('object');
      expect(result.id).to.equal(lastPromoId);
    });
  });

  describe('Update Promo', () => {
    before(async function () {
      this.promo = await PromoModel.create({
        name: chance.first(),
        template: PromoTemplate.Deposit,
        title: chance.first(),
        description: chance.sentence(),
        submitted: true,
        enabled: true,
        status: PromoStatus.Active,
        minimumBalance: chance.natural(),
      });
    });

    context('Given incorrect values', () => {
      it('should throw an error for empty name', async function () {
        const data = {
          name: '',
          template: PromoTemplate.Deposit,
          title: this.promo.title,
          description: this.promo.description,
          minimumBalance: chance.prime(),
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Promo name must be provided.');
      });

      it('should throw an error for empty template', async function () {
        const data = {
          name: this.promo.name,
          template: null,
          title: this.promo.title,
          description: this.promo.description,
          minimumBalance: chance.prime(),
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Template must be provided.');
      });

      it('should throw an error for invalid template', async function () {
        const data = {
          name: this.promo.name,
          template: 'Test',
          title: this.promo.title,
          description: this.promo.description,
          minimumBalance: chance.prime(),
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'INVALID_PROMO_TYPE',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Invalid template.');
      });

      it('should throw an error for empty title', async function () {
        const data = {
          name: this.promo.name,
          template: PromoTemplate.Deposit,
          title: '',
          description: this.promo.description,
          minimumBalance: chance.prime(),
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Promo title must be provided');
      });

      it('should throw an error for empty description', async function () {
        const data = {
          name: this.promo.name,
          template: PromoTemplate.Deposit,
          title: this.promo.title,
          description: '',
          minimumBalance: chance.prime(),
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Description must be provided.');
      });

      it('should throw an error for empty minimum balance given the template is deposit', async function () {
        const data = {
          name: this.promo.name,
          template: PromoTemplate.Deposit,
          title: this.promo.title,
          description: this.promo.description,
          minimumBalance: null,
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Minimum balance must be provided.');
      });

      it('should throw an error for empty member fields given the template is sign up', async function () {
        const data = {
          name: this.promo.name,
          template: PromoTemplate.SignUp,
          title: this.promo.title,
          description: this.promo.description,
          requiredMemberFields: [],
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_VALIDATION_ERROR',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Members fields must be provided.');
      });

      it('should throw an error for invalid member fields given the template is sign up', async function () {
        const data = {
          name: this.promo.name,
          template: PromoTemplate.SignUp,
          title: this.promo.title,
          description: this.promo.description,
          requiredMemberFields: ['Test'],
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'INVALID_MEMBER_FIELD',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Test is an invalid field.');
      });

      it('should throw an error for invalid status', async function () {
        const data = {
          name: this.promo.name,
          template: PromoTemplate.SignUp,
          title: this.promo.title,
          description: this.promo.description,
          requiredMemberFields: [MemberFields.REAL_NAME],
          status: 'Test',
        };

        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'INVALID_PROMO_STATUS',
        );
        await expect(
          updatePromo(this.promo.id, data),
        ).to.eventually.rejectedWith('Invalid status.');
      });
    });

    context('Given correct values', () => {
      it('should update promo and return true', async () => {
        const promos = await listPromos();

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.Deposit,
          title: lastPromo.title,
          description: lastPromo.description,
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const result = await updatePromo(lastPromo.id, data);

        expect(result).to.be.true;
      });
    });
  });

  describe('Delete Promo', () => {
    it('should delete one promo', async () => {
      const data = {
        name: chance.name(),
        template: PromoTemplate.Deposit,
        title: chance.word(),
        description: chance.sentence(),
        minimumBalance: chance.prime(),
      };

      await insertPromo(data);

      const promos = await listPromos();

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promos.edges);

      const result = await deletePromo(lastPromoId);

      expect(result).to.be.true;
    });

    it('should throw error for delete active promo', async () => {
      const data = {
        name: chance.name(),
        template: PromoTemplate.Deposit,
        title: chance.word(),
        description: chance.sentence(),
        minimumBalance: chance.prime(),
        status: PromoStatus.Active,
      };

      await insertPromo(data);

      const promos = await listPromos();

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promos.edges);

      await expect(
        deletePromo(lastPromoId),
      ).to.eventually.rejected.and.to.have.property(
        'name',
        'PROMO_STATUS_ERROR',
      );
      await expect(deletePromo(lastPromoId)).to.eventually.rejectedWith(
        'Cannot delete active promo.',
      );
    });
  });
});
