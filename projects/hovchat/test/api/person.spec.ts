/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { create } from 'src/library/auth';

import chance from 'test/helpers/chance';
import request from 'test/helpers/request';

import Model from 'src/model';

import 'test/api/common';

describe('Person API', () => {
  describe('POST /persons', () => {
    it('should call the `createPersonController`', async function () {
      await request.post('/persons').send({ id: chance.guid() });

      expect(this.createPersonControllerStub.calledOnce).to.be.true;
      const args = this.createPersonControllerStub.args[0][0];
      expect(args).to.have.property('path', '/persons');
      expect(args).to.have.nested.property('request.body.id').to.a('string');
      expect(args.get('Integration-Key')).to.be.a('string');
    });
  });

  describe('PUT /persons/', () => {
    before(async function () {
      this.channelId = chance.guid();

      this.integrationKey = chance.guid();

      await Model.Integration.create({ key: this.integrationKey });

      this.sender = chance.guid();
      this.recipient = chance.guid();

      await Model.Person.create({
        id: this.sender,
        integration: this.integrationKey,
      });

      this.authorizationKey = await create({
        integrationKey: this.integrationKey,
        person: this.sender,
      });
    });

    after(async function () {
      await Model.Integration.deleteMany({});
      await Model.Person.deleteMany({});
    });

    it('should call the `updatePersonController`', async function () {
      await request
        .put(`/persons`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ status: chance.word() });

      expect(this.updatePersonController.calledOnce).to.be.true;
      const args = this.updatePersonController.args[0][0];
      expect(args).to.have.property('path', `/persons`);

      expect(args.get('Authorization')).to.be.a('string');

      expect(args)
        .to.have.nested.property('request.body.status')
        .to.be.a('string');
    });
  });

  describe('DELETE /persons/:id', () => {
    it('should call the `deletePersonController`', async function () {
      const personId = chance.guid();
      await request.delete(`/persons/${personId}`).send({});

      expect(this.deletePersonControllerStub.calledOnce).to.be.true;
      const args = this.deletePersonControllerStub.args[0][0];
      expect(args).to.have.property('path', `/persons/${personId}`);
      expect(args).to.have.nested.property('params.id').to.a('string');
      expect(args.get('Integration-Key')).to.be.a('string');
    });
  });
});
