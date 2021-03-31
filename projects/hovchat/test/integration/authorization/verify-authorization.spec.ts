/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chance from 'test/helpers/chance';

import Model from 'src/model';

import * as api from 'src/services/api';
import { create } from 'src/library/auth';
import { verifyAuthorization } from 'src/library/verify-authorization';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('Authorization', () => {
  before(async function () {
    await api.start();

    this.integrationKey = chance.guid();

    await Model.Integration.create({ key: this.integrationKey });

    this.personId = chance.string();

    await Model.Person.create({
      id: this.personId,
      integration: this.integrationKey,
    });
  });

  after(async () => {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
    await api.stop();
  });

  describe('Verify Authorization', () => {
    it('should call next() once given authorization is valid', async function () {
      const nextSpy = sinon.spy();

      const authorizationKey = await create({
        integrationKey: this.integrationKey,
        person: this.personId,
      });

      const data: any = {
        get: () => {
          return `Bearer ${authorizationKey}`;
        },
        state: {
          person: null,
          integration: null,
        },
      };

      await verifyAuthorization(data, nextSpy);

      expect(nextSpy.calledOnce).to.be.true;
    });

    it('should return error given authorization is not provided.', async function () {
      const nextSpy = sinon.spy();

      const data: any = {
        get: () => {
          return null;
        },
        state: {
          person: null,
          integration: null,
        },
      };

      const result = await verifyAuthorization(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Authorization must be provided.',
      );
    });

    it('should return error given invalid authorization key.', async function () {
      const nextSpy = sinon.spy();

      const data: any = {
        get: () => {
          return `Bearer token`;
        },
        state: {
          person: null,
          integration: null,
        },
      };

      const result = await verifyAuthorization(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Invalid authorization key.',
      );
    });

    it('should return error given invalid integration key.', async function () {
      const nextSpy = sinon.spy();

      const authorizationKey = await create({
        integrationKey: chance.guid(),
        person: this.personId,
      });

      const data: any = {
        get: () => {
          return `Bearer ${authorizationKey}`;
        },
        state: {
          person: null,
          integration: null,
        },
      };

      const result = await verifyAuthorization(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Integration Key does not exist.',
      );
    });

    it('should return error given invalid person id.', async function () {
      const nextSpy = sinon.spy();

      const authorizationKey = await create({
        integrationKey: this.integrationKey,
        person: chance.guid(),
      });

      const data: any = {
        get: () => {
          return `Bearer ${authorizationKey}`;
        },
        state: {
          person: null,
          integration: null,
        },
      };

      const result = await verifyAuthorization(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Person does not exist.',
      );
    });

    it('should return error given person is deleted.', async function () {
      const nextSpy = sinon.spy();

      const person = await Model.Person.create({
        id: chance.guid(),
        integration: this.integrationKey,
      });

      await Model.Person.findByIdAndUpdate(person.id, {
        archived: true,
      });

      const authorizationKey = await create({
        integrationKey: this.integrationKey,
        person: person.id,
      });

      const data: any = {
        get: () => {
          return `Bearer ${authorizationKey}`;
        },
        state: {
          person: null,
          integration: null,
        },
      };

      const result = await verifyAuthorization(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Person does not exist.',
      );
    });
  });
});
