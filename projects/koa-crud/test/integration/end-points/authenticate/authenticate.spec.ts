/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Chance from 'chance';
import server from '@server';
import MemberModel from '@models/member';
import { createHash } from '@encryption';

const chance = new Chance();

chai.use(chaiHttp);

describe('Authenticate End-Point', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Authenticate Member', () => {
    context('Given incorrect values', () => {
      it('should return error for empty username', async function () {
        const data = {
          username: null,
          password: chance.string({ length: 5 }),
        };

        const response = await this.request()
          .post('/api/authenticate')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Username must be provided.');
      });

      it('should return error for empty password', async function () {
        const data = {
          username: chance.last(),
          password: null,
        };

        const response = await this.request()
          .post('/api/authenticate')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body.errorMsg).to.equal('Password must be provided.');
      });
    });

    context('Given correct values', () => {
      afterEach(async function () {
        await MemberModel.deleteMany({});
      });

      it('should throw an error for invalid password', async function () {
        const data = {
          username: chance.word(),
          password: chance.string({ length: 5 }),
        };

        await MemberModel.create(data);

        const response = await this.request()
          .post('/api/authenticate')
          .type('json')
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property(
          'errorMsg',
          'Authenticate failed.',
        );
      });

      it('should return token', async function () {
        const password = '1234';

        const data = {
          username: chance.word(),
          password: await createHash(password),
        };

        await MemberModel.create(data);

        const response = await this.request()
          .post('/api/authenticate')
          .type('json')
          .send({ username: data.username, password });

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('token');
      });
    });
  });
});
