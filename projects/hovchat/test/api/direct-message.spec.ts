/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { create } from 'src/library/auth';

import chance from 'test/helpers/chance';
import request from 'test/helpers/request';

import Model from 'src/model';

import 'test/api/common';

describe('Direct Message API', () => {
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

  describe('POST /direct-message/:recipient', () => {
    it('should call the `postDirectMessageController`', async function () {
      await request
        .post(`/direct-message/${this.recipient}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ body: chance.sentence() });

      expect(this.postDirectMessageController.calledOnce).to.be.true;
      const args = this.postDirectMessageController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/direct-message/${this.recipient}`,
      );
      expect(args.get('Authorization')).to.be.a('string');
      expect(args)
        .to.have.nested.property('request.body.body')
        .to.be.a('string');
      expect(args)
        .to.have.nested.property('params.recipient')
        .to.be.a('string');
    });
  });

  describe('GET /channels/:channelId/message', () => {
    it('should call the `getDirectMessagesController`', async function () {
      await request
        .get(`/direct-message/${this.recipient}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ body: chance.sentence() });

      expect(this.getDirectMessagesController.calledOnce).to.be.true;
      const args = this.getDirectMessagesController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/direct-message/${this.recipient}`,
      );
      expect(args.get('Authorization')).to.be.a('string');
      expect(args)
        .to.have.nested.property('params.recipient')
        .to.be.a('string');
    });
  });

  describe('DELETE /channels/:channelId/message/:message', () => {
    it('should call the `deleteDirectMessageController`', async function () {
      const message = chance.guid();
      await request
        .delete(`/direct-message/${this.recipient}/${message}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send();

      expect(this.deleteDirectMessageController.calledOnce).to.be.true;
      const args = this.deleteDirectMessageController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/direct-message/${this.recipient}/${message}`,
      );
      expect(args.get('Authorization')).to.be.a('string');
      expect(args)
        .to.have.nested.property('params.recipient')
        .to.be.a('string');
      expect(args).to.have.nested.property('params.message').to.be.a('string');
    });
  });
});
