/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  createPersonController,
  deletePersonController,
  updatePersonController,
} from 'src/controller/person';
import * as api from 'src/services/api';
import chance from 'test/helpers/chance';

import Model from 'src/model';

import '../common';

chai.use(chaiAsPromised);

describe('Person Controller', () => {
  before(async function () {
    const sandbox = this.sandbox as sinon.SinonSandbox;

    this.createContactSpy = sandbox.spy(Model.Contact, 'create');

    await api.start();

    this.integrationKey = chance.guid();
    await Model.Integration.create({ key: this.integrationKey });
  });

  after(async () => {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
    await api.stop();
  });

  describe('Create Person', () => {
    before(async function () {
      this.personId = chance.string();

      await Model.Person.create({
        id: this.personId,
        integration: this.integrationKey,
      });
    });

    it('should throw an error given null integration key', async function () {
      const data: any = {
        get: () => {
          return null;
        },
        request: {
          body: {
            id: chance.string(),
          },
        },
      };

      await expect(createPersonController(data))
        .to.eventually.rejectedWith('Integration Key must be provided.')
        .and.to.have.property('name', 'INVALID_INTEGRATION_KEY_ERROR');
    });

    it('should throw an error given integration key does not exist', async function () {
      const data: any = {
        get: () => {
          return chance.string();
        },
        request: {
          body: {
            id: chance.string(),
          },
        },
      };

      await expect(createPersonController(data))
        .to.eventually.rejectedWith('Integration Key does not exist.')
        .and.to.have.property('name', 'INTEGRATION_KEY_NOT_FOUND');
    });

    it('should throw an error given id already exist', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            id: this.personId,
          },
        },
      };

      await expect(createPersonController(data))
        .to.eventually.rejectedWith('Person Id already exist.')
        .and.to.have.property('name', 'DUPLICATE_ID_ERROR');
    });

    it('should return true given inputs are correct', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            id: chance.string(),
          },
        },
      };

      const { body } = await createPersonController(data);

      expect(body).to.be.true;
      expect(this.createContactSpy.calledOnce).to.be.true;
    });
  });

  describe('Update Person', () => {
    it('should return true given inputs are correct', async function () {
      const data: any = {
        request: { body: { status: chance.word() } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: chance.guid() },
          integration: { key: this.integrationKey },
        },
      };

      const { body } = await updatePersonController(data);

      expect(body).to.be.true;
    });
  });

  describe('Delete Person', () => {
    beforeEach(async function () {
      this.personId = chance.string();

      await Model.Person.create({
        id: this.personId,
        integration: this.integrationKey,
      });
    });

    it('should throw an error given null integration key', async function () {
      const data: any = {
        get: () => {
          return null;
        },
        params: {
          id: this.personId,
        },
      };

      await expect(deletePersonController(data))
        .to.eventually.rejectedWith('Integration Key must be provided.')
        .and.to.have.property('name', 'INVALID_INTEGRATION_KEY_ERROR');
    });

    it('should throw an error given integration key does not exist', async function () {
      const data: any = {
        get: () => {
          return chance.string();
        },
        params: {
          id: this.personId,
        },
      };

      await expect(deletePersonController(data))
        .to.eventually.rejectedWith('Integration Key does not exist.')
        .and.to.have.property('name', 'INTEGRATION_KEY_NOT_FOUND');
    });

    it('should throw an error given id does not exist', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        params: {
          id: chance.string(),
        },
      };

      await expect(deletePersonController(data))
        .to.eventually.rejectedWith('Person Id does not exist.')
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should delete person and return true', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        params: {
          id: this.personId,
        },
      };

      const { body } = await deletePersonController(data);

      expect(body).to.be.true;
    });
  });
});
