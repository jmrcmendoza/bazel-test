/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as api from 'src/services/api';
import chance from 'test/helpers/chance';

import Model from 'src/model';
import { authenticateController } from 'src/controller/authentication';

chai.use(chaiAsPromised);

describe('Authenticate Controller', () => {
  before(async function () {
    await api.start();

    this.integrationKey = chance.guid();
    await Model.Integration.create({ key: this.integrationKey });

    this.person = await Model.Person.create({
      id: chance.guid(),
      integration: this.integrationKey,
    });
  });

  after(async () => {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
    await api.stop();
  });

  describe('Authenticate Person', () => {
    it('should throw an error given null integration key', async function () {
      const data: any = {
        get: () => {
          return null;
        },
        request: { body: { person: this.person.id } },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await expect(authenticateController(data))
        .to.eventually.rejectedWith('Integration Key must be provided.')
        .and.to.have.property('name', 'INVALID_INTEGRATION_KEY_ERROR');
    });

    it('should throw an error given integration key does not exist', async function () {
      const data: any = {
        get: () => {
          return chance.string();
        },
        request: { body: { person: this.person.id } },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await expect(authenticateController(data))
        .to.eventually.rejectedWith('Integration Key does not exist.')
        .and.to.have.property('name', 'INTEGRATION_KEY_NOT_FOUND');
    });

    it('should throw an error given no person id provided', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: { body: {} },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await expect(authenticateController(data))
        .to.eventually.rejectedWith('Person must be provided.')
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should return token', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: { body: { person: this.person.id } },
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { body, status } = await authenticateController(data);

      expect(status).to.equal(201);
      expect(body).to.have.property('token').and.to.be.a('string');
    });

    it('should throw an error given person is archived', async function () {
      const person = await Model.Person.create({
        id: chance.guid(),
        integration: this.integrationKey,
      });

      await Model.Person.findByIdAndUpdate(person.id, {
        archived: true,
      });

      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: { body: { person: person.id } },
        headers: {
          'Content-Type': 'application/json',
          'Integration-Key': this.integrationKey,
        },
      };

      await expect(authenticateController(data))
        .to.eventually.rejectedWith('Person does not exist.')
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });
  });
});
