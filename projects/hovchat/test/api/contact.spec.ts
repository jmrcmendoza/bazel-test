/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';

import chance from 'test/helpers/chance';
import request from 'test/helpers/request';

import 'test/api/common';
import Model from 'src/model/';
import { create } from 'src/library/auth';

describe('Contact API', () => {
  before(async function () {
    this.integrationKey = chance.guid();

    await Model.Integration.create({ key: this.integrationKey });

    const person = chance.guid();

    await Model.Person.create({
      id: person,
      integration: this.integrationKey,
    });

    this.authorizationKey = await create({
      integrationKey: this.integrationKey,
      person,
    });
  });

  after(async function () {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
  });

  describe('POST /contacts/:personId', () => {
    it('should call the `addContactController`', async function () {
      const contact = chance.guid();
      await request
        .post(`/contacts/${contact}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send();

      expect(this.addContactController.calledOnce).to.be.true;
      const args = this.addContactController.args[0][0];
      expect(args).to.have.property('path', `/contacts/${contact}`);
      expect(args.get('Authorization')).to.be.a('string');
      expect(args).to.have.nested.property('params.personId').to.be.a('string');
    });
  });

  describe('GET /contacts', () => {
    it('should call the `getContactsController`', async function () {
      await request
        .get('/contacts')
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({});

      expect(this.getContactsController.calledOnce).to.be.true;
      const args = this.getContactsController.args[0][0];
      expect(args).to.have.property('path', '/contacts');
      expect(args.get('Authorization')).to.be.a('string');
    });
  });

  describe('DELETE /contacts/:personId', () => {
    it('should call the `deleteContactController`', async function () {
      const contact = chance.guid();
      await request
        .delete(`/contacts/${contact}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ contacts: [chance.guid()] });

      expect(this.deleteContactController.calledOnce).to.be.true;
      const args = this.deleteContactController.args[0][0];
      expect(args).to.have.property('path', `/contacts/${contact}`);
      expect(args).to.have.nested.property('params.personId').to.a('string');
      expect(args.get('Authorization')).to.be.a('string');
    });
  });
});
