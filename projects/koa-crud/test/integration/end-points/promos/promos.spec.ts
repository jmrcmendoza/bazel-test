/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Chance from 'chance';
import R from 'ramda';
import { MemberFields, PromoStatus, PromoTemplate } from '@models/promo';
import server from '@server';

const chance = new Chance();

chai.use(chaiHttp);

describe('Member End-Points', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Add Promo', () => {
    context('Given incorrect values', () => {
      it('should return error for empty name', async function () {
        const data = {
          name: '',
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Promo name must be provided.');
      });

      it('should return error for empty template', async function () {
        const data = {
          name: chance.name(),
          template: '',
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Template must be provided.');
      });

      it('should return error for invalid template', async function () {
        const data = {
          name: chance.name(),
          template: 'Test',
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Invalid template.');
      });

      it('should return error for empty title', async function () {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: '',
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Promo title must be provided');
      });

      it('should return error for empty description', async function () {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: '',
          minimumBalance: chance.prime(),
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal(
          'Description must be provided.',
        );
      });

      it('should return error for empty balance given the template is deposit', async function () {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: null,
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal(
          'Minimum balance must be provided.',
        );
      });

      it('should return error for empty member fields given the template is sign up', async function () {
        const data = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: [],
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal(
          'Members fields must be provided.',
        );
      });

      it('should return error for invalid member fields given the template is sign up', async function () {
        const data = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: ['Test'],
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Test is an invalid field.');
      });

      it('should return error for invalid status', async function () {
        const data = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: [MemberFields.BANK_ACCOUNT],
          status: 'Test',
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Invalid status.');
      });
    });

    context('Given correct values', () => {
      it('should insert promo', async function () {
        const data = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
        };

        const response = await this.request()
          .post('/api/promos')
          .type('json')
          .send(data);

        expect(response.status).to.equal(201);
        expect(response.body).to.exist;
        expect(response.body).to.be.true;
      });
    });
  });

  describe('List Promos', () => {
    it('should return all promos', async function () {
      const response = await this.request().get('/api/promos');

      expect(response.body).to.exist;
      expect(response.body.edges)
        .to.be.an('array')
        .that.has.length.greaterThan(0);
    });

    it('should return one promo', async function () {
      const promos = await this.request().get('/api/promos');

      const lastPromoId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(promos.body.edges);

      const response = await this.request().get(`/api/promos/${lastPromoId}`);

      expect(response.body).to.exist;
      expect(response.body).to.be.an('object');
    });
  });

  describe('Update Promo', () => {
    context('Given incorrect values', () => {
      it('should return error for empty name', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: '',
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Promo name must be provided.');
      });

      it('should return error for empty template', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: null,
          title: lastPromo.name,
          description: lastPromo.description,
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Template must be provided.');
      });

      it('should return error for invalid template', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: 'Test',
          title: lastPromo.name,
          description: lastPromo.description,
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Invalid template.');
      });

      it('should return error for empty title', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.Deposit,
          title: '',
          description: lastPromo.description,
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Promo title must be provided');
      });

      it('should return error for empty description', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.Deposit,
          title: lastPromo.title,
          description: '',
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal(
          'Description must be provided.',
        );
      });

      it('should return error for empty minimum balance given template is deposit', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.Deposit,
          title: lastPromo.title,
          description: lastPromo.description,
          minimumBalance: null,
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal(
          'Minimum balance must be provided.',
        );
      });

      it('should return error for empty member fields given template is sign up', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.SignUp,
          title: lastPromo.title,
          description: lastPromo.description,
          requiredMemberFields: [],
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal(
          'Members fields must be provided.',
        );
      });

      it('should return error for invalid member fields given template is sign up', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.SignUp,
          title: lastPromo.title,
          description: lastPromo.description,
          requiredMemberFields: ['Test'],
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Test is an invalid field.');
      });

      it('should return error for invalid status', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.SignUp,
          title: lastPromo.title,
          description: lastPromo.description,
          requiredMemberFields: [MemberFields.BANK_ACCOUNT, MemberFields.EMAIL],
          status: 'TEST',
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Invalid status.');
      });
    });

    context('Given correct values', () => {
      it('should return error for empty name', async function () {
        const promos = await this.request().get('/api/promos');

        const lastPromo = R.compose(R.prop('node'), R.last)(promos.body.edges);

        const data = {
          name: lastPromo.name,
          template: PromoTemplate.Deposit,
          title: lastPromo.title,
          description: lastPromo.description,
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        const response = await this.request()
          .put(`/api/promos/${lastPromo.id}`)
          .type('json')
          .send(data);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.true;
      });
    });
  });

  describe('Delete Promo', () => {
    it('should delete promo', async function () {
      const data = {
        name: chance.name(),
        template: PromoTemplate.Deposit,
        title: chance.word(),
        description: chance.sentence(),
        minimumBalance: chance.prime(),
      };

      await this.request().post('/api/promos').type('json').send(data);

      const promos = await this.request().get('/api/promos');

      const lastPromoId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(promos.body.edges);

      const response = await this.request().delete(
        `/api/promos/${lastPromoId}`,
      );

      expect(response.status).to.equal(200);
      expect(response.body).to.be.true;
    });

    it('should throw an error for deleting active promo', async function () {
      const data = {
        name: chance.name(),
        template: PromoTemplate.Deposit,
        title: chance.word(),
        description: chance.sentence(),
        minimumBalance: chance.prime(),
        status: PromoStatus.Active,
      };

      await this.request().post('/api/promos').type('json').send(data);

      const promos = await this.request().get('/api/promos');

      const lastPromoId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(promos.body.edges);

      const response = await this.request().delete(
        `/api/promos/${lastPromoId}`,
      );

      expect(response.status).to.equal(400);
      expect(response.body.errorMsg).to.equal('Cannot delete active promo.');
    });
  });
});
