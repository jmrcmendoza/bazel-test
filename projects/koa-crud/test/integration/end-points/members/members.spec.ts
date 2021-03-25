/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Chance from 'chance';
import R from 'ramda';
import server from '@server';
import { getLastData } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);

describe('Member End-Points', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Add vendor', () => {
    context('Given incorrect values', () => {
      it('should return error for empty username', async function () {
        const data = {
          username: null,
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        const response = await this.request()
          .post('/api/members')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Username must be provided.');
      });

      it('should return error for empty password', async function () {
        const data = {
          username: chance.last(),
          password: null,
          realName: chance.name(),
        };

        const response = await this.request()
          .post('/api/members')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Password must be provided.');
      });
    });

    context('Given correct values', () => {
      it('should insert new member', async function () {
        const data = {
          username: chance.last(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };
        const response = await this.request()
          .post('/api/members')
          .type('json')
          .send(data);

        expect(response.status).to.equal(201);
        expect(response.body).to.exist;
        expect(response.body).to.be.true;
      });
    });
  });

  describe('List Members', () => {
    it('should return all vendors', async function () {
      const response = await this.request().get('/api/members');

      expect(response.body).to.exist;
      expect(response.body.edges)
        .to.be.an('array')
        .that.has.length.greaterThan(0);
    });

    it('should return one member', async function () {
      const vendors = await this.request().get('/api/members');

      const lastVendorId = R.compose(R.prop('_id'), R.last)(vendors.body);

      const response = await this.request().get(`/api/members/${lastVendorId}`);

      expect(response.body).to.exist;
      expect(response.body).to.be.an('object');
    });
  });

  describe('Edit Member', () => {
    context('Given incorrect values', () => {
      it('should throw error for empty username', async function () {
        const members = await this.request().get('/api/members');

        const lastMember = getLastData(members.body.edges);

        const data = {
          username: '',
          password: lastMember.password,
          realName: lastMember.realName,
        };

        const response = await this.request()
          .put(`/api/members/${lastMember._id}`)
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Username must be provided.');
      });

      it('should throw error for empty password', async function () {
        const members = await this.request().get('/api/members');

        const lastMember = getLastData(members.body.edges);

        const data = {
          username: lastMember.username,
          password: '',
          realName: lastMember.realName,
        };

        const response = await this.request()
          .put(`/api/members/${lastMember._id}`)
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Password must be provided.');
      });
    });

    context('Given correct values', () => {
      it('should update member', async function () {
        const members = await this.request().get('/api/members');

        const lastMember = getLastData(members.body.edges);

        const data = {
          username: lastMember.username,
          password: chance.string({ length: 5 }),
          realName: lastMember.realName,
        };

        const response = await this.request()
          .put(`/api/members/${lastMember._id}`)
          .send(data);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.true;
      });
    });
  });

  describe('Delete Member', () => {
    it('should delete one member', async function () {
      const members = await this.request().get('/api/members');

      const lastMemberId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(members.body.edges);

      const response = await this.request().delete(
        `/api/members/${lastMemberId}`,
      );

      expect(response.status).to.equal(200);
      expect(response.body).to.exist;
      expect(response.body).to.be.true;
    });
  });
});
