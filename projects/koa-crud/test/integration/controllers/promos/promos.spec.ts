/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import R from 'ramda';
import server from '@server';
import {
  delPromo,
  getOnePromo,
  getPromos,
  postPromo,
  putPromo,
} from '@controllers/promos';
import { MemberFields, PromoStatus, PromoTemplate } from '@models/promo';
import { getLastDataId } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Promo Controller', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  after(async function () {
    server.close();
  });

  describe('Create Promo', () => {
    context('Given incorrect values', () => {
      it('should return 400 status code for empty name', async () => {
        const data = {
          body: {
            name: '',
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Promo name must be provided.',
        );
      });

      it('should return 400 status code for empty templete', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: '',
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Template must be provided.',
        );
      });

      it('should return 400 status code for invalid templete', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: 'Test',
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property('errorMsg', 'Invalid template.');
      });

      it('should return 400 status code for empty description', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: '',
            minimumBalance: chance.prime(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Description must be provided.',
        );
      });

      it('should return 400 status code for empty balance given template is deposit', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: chance.sentence(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Minimum balance must be provided.',
        );
      });

      it('should return 400 status code for empty member fields given template is sign up', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: PromoTemplate.SignUp,
            title: chance.word(),
            description: chance.sentence(),
            requiredMemberFields: [],
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Members fields must be provided.',
        );
      });

      it('should return 400 status code for invalid member fields given template is sign up', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: PromoTemplate.SignUp,
            title: chance.word(),
            description: chance.sentence(),
            requiredMemberFields: ['Test'],
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Test is an invalid field.',
        );
      });

      it('should return 400 status code for invalid status', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
            status: 'TEST',
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property('errorMsg', 'Invalid status.');
      });
    });

    context('Given correct values', () => {
      it('should insert promo and return 201 status code', async () => {
        const data = {
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postPromo(data);

        expect(result).to.have.property('status', 201);
        expect(result.body).to.be.true;
      });
    });
  });

  describe('List Promos', () => {
    it('should retrieve all promos and return 200 status code', async () => {
      const data = {
        query: {},
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };

      const result = await getPromos(data);

      expect(result).property('status', 200);
      expect(result.body.totalCount).to.be.greaterThan(0);
    });

    it('should retrieve one promos and return 200 status code', async () => {
      const data = {
        query: {},
        params: {},
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };
      const promos = await getPromos(data);

      data.params = {
        id: R.compose(R.prop('_id'), R.prop('node'), R.last)(promos.body.edges),
      };

      await expect(getOnePromo(data)).to.eventually.fulfilled.property(
        'status',
        200,
      );
    });
  });

  describe('Edit Promo', () => {
    context('Given incorrect values', () => {
      it('should return 400 status code for empty name', async () => {
        const data = {
          params: {},
          query: {},
          body: {
            name: '',
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Promo name must be provided.',
        );
      });

      it('should return 400 status code for empty template', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: '',
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Template must be provided.',
        );
      });

      it('should return 400 status code for invalid template', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: 'Test',
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property('errorMsg', 'Invalid template.');
      });

      it('should return 400 status code for empty title', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: '',
            description: chance.sentence(),
            minimumBalance: chance.prime(),
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Promo title must be provided',
        );
      });

      it('should return 400 status code for empty description', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: '',
            minimumBalance: chance.prime(),
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Description must be provided.',
        );
      });

      it('should return 400 status code for empty balance given the template is deposit', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: chance.sentence(),
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Minimum balance must be provided.',
        );
      });

      it('should return 400 status code for empty member fields the template is sign up', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.SignUp,
            title: chance.word(),
            description: chance.sentence(),
            requiredMemberFields: [],
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Members fields must be provided.',
        );
      });

      it('should return 400 status code for invalid member fields the template is sign up', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.SignUp,
            title: chance.word(),
            description: chance.sentence(),
            requiredMemberFields: [],
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Members fields must be provided.',
        );
      });

      it('should return 400 status code for invalid member fields the template is sign up', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.SignUp,
            title: chance.word(),
            description: chance.sentence(),
            requiredMemberFields: ['Test'],
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property(
          'errorMsg',
          'Test is an invalid field.',
        );
      });

      it('should return 400 status code for invalid status', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.SignUp,
            title: chance.word(),
            description: chance.sentence(),
            requiredMemberFields: [MemberFields.BANK_ACCOUNT],
            status: 'TEST',
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 400);
        expect(result.body).to.have.property('errorMsg', 'Invalid status.');
      });
    });

    context('Given correct values', () => {
      it('should update last promo', async () => {
        const data = {
          query: {},
          params: {},
          body: {
            name: chance.name(),
            template: PromoTemplate.Deposit,
            title: chance.word(),
            description: chance.sentence(),
            minimumBalance: chance.prime(),
            status: PromoStatus.Active,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const promos = await getPromos(data);

        const lastPromoId = getLastDataId(promos.body.edges);

        data.params = { id: lastPromoId };

        const result = await putPromo(data);

        expect(result).to.have.property('status', 200);
        expect(result.body).to.be.true;
      });
    });
  });

  describe('Delete Promo', () => {
    it('should delete last promo and return status code of 200', async () => {
      const data = {
        query: {},
        params: {},
        body: {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        },
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };

      await postPromo(data);

      const promos = await getPromos(data);

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promos.body.edges);

      data.params = { id: lastPromoId };

      const result = await delPromo(data);

      expect(result).to.have.property('status', 200);
      expect(result.body).to.be.true;
    });

    it('should throw an error for deleting active promo', async () => {
      const data = {
        query: {},
        params: {},
        body: {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        },
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };

      await postPromo(data);

      const promos = await getPromos(data);

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promos.body.edges);

      data.params = { id: lastPromoId };

      const result = await delPromo(data);

      expect(result).to.have.property('status', 400);
      expect(result.body).to.have.property(
        'errorMsg',
        'Cannot delete active promo.',
      );
    });
  });
});
