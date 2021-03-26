/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as api from 'src/services/api';
import chance from 'test/helpers/chance';
import R from 'ramda';

import Model from 'src/model';
import {
  addContactController,
  deleteContactController,
} from 'src/controller/contacts';
import getContactController from 'src/controller/contacts/get-contacts';

chai.use(chaiAsPromised);

describe('Contacts Controller', () => {
  before(async function () {
    await api.start();

    this.contacts = [chance.string(), chance.string()];
    this.integrationKey = chance.guid();
    this.person = chance.string();

    await Model.Integration.create({
      key: this.integrationKey,
      contacts: true,
    });

    await Model.Person.create({
      id: this.person,
      integration: this.integrationKey,
    });

    R.times(
      async (i) =>
        await Model.Person.create({
          id: this.contacts[i],
          integration: this.integrationKey,
        }),
      this.contacts.length,
    );
  });

  after(async () => {
    await Model.Contact.deleteMany({});
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
    await api.stop();
  });

  describe('Add Contact', () => {
    before(async function () {
      this.contact = await Model.Contact.create({
        person: this.person,
        contacts: [],
        integration: this.integrationKey,
      });
    });

    it('should thrown an error given integration not allow to create contact', async function () {
      const data: any = {
        params: { personId: chance.guid() },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.person },
          integration: { key: chance.guid() },
        },
      };

      await expect(addContactController(data))
        .to.eventually.rejectedWith('Cannot add contact.')
        .and.to.have.property('name', 'ACTION_NOT_ALLOWED');
    });

    it('should throw an error given person does not exist', async function () {
      const data: any = {
        params: { personId: chance.guid() },
        state: {
          person: { id: this.person },
          integration: { key: this.integrationKey, contacts: true },
        },
      };

      await expect(addContactController(data))
        .to.eventually.rejectedWith('Person does not exist.')
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should return true given inputs are correct', async function () {
      const data: any = {
        params: { personId: this.contacts[0] },
        state: {
          person: { id: this.person },
          integration: { key: this.integrationKey, contacts: true },
        },
      };

      const { body } = await addContactController(data);

      expect(body).to.be.true;
    });
  });

  describe('Get Contacts', () => {
    before(async function () {
      this.contact = await Model.Contact.create({
        person: this.person,
        contacts: this.contacts,
        integration: this.integrationKey,
      });
    });

    it('should thrown an error given integration not allow to create contact', async function () {
      const data: any = {
        request: { body: {} },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.person },
          integration: { key: chance.guid() },
        },
      };

      await expect(getContactController(data))
        .to.eventually.rejectedWith('Cannot add contact.')
        .and.to.have.property('name', 'ACTION_NOT_ALLOWED');
    });

    it('should return the contacts', async function () {
      const data: any = {
        request: { body: {} },
        state: {
          person: { id: this.person },
          integration: { key: this.integrationKey, contacts: true },
        },
      };

      const { body } = await getContactController(data);

      expect(body).to.be.an('object');
    });
  });

  describe('Delete Contact', () => {
    before(async function () {
      this.contact = await Model.Contact.create({
        person: this.person,
        contacts: this.contacts,
        integration: this.integrationKey,
      });
    });

    it('should thrown an error given integration not allow to create contact', async function () {
      const data: any = {
        request: { body: {} },
        params: { personId: this.contacts[0] },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.person },
          integration: { key: chance.guid() },
        },
      };

      await expect(deleteContactController(data))
        .to.eventually.rejectedWith('Cannot add contact.')
        .and.to.have.property('name', 'ACTION_NOT_ALLOWED');
    });

    it('should thrown an error given contact does not exist', async function () {
      const data: any = {
        params: { personId: chance.guid() },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.person },
          integration: { key: this.integrationKey, contacts: true },
        },
      };

      await expect(deleteContactController(data))
        .to.eventually.rejectedWith('Person does not exist.')
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should return true given inputs are correct', async function () {
      const data: any = {
        params: { personId: this.contacts[0] },
        request: {
          body: {
            contacts: this.contacts,
          },
        },
        state: {
          person: { id: this.person },
          integration: { key: this.integrationKey, contacts: true },
        },
      };

      const { body } = await deleteContactController(data);

      expect(body).to.be.true;
    });
  });
});
