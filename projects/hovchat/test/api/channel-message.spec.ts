/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { create } from 'src/library/auth';

import chance from 'test/helpers/chance';
import request from 'test/helpers/request';

import Model from 'src/model';

import 'test/api/common';

describe('Channel Message API', () => {
  before(async function () {
    this.integrationKey = chance.guid();

    await Model.Integration.create({ key: this.integrationKey });

    this.personId = chance.guid();

    await Model.Person.create({
      id: this.personId,
      integration: this.integrationKey,
    });

    this.channel = await Model.Channel.create({
      id: chance.guid(),
      persons: [this.personId, chance.guid()],
      integration: this.integrationKey,
    });

    this.authorizationKey = await create({
      integrationKey: this.integrationKey,
      person: this.personId,
    });
  });

  after(async function () {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
  });

  describe('POST /channels/:channelId/message', () => {
    it('should call the `postMessageController`', async function () {
      await request
        .post(`/channels/${this.channel.id}/message`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ body: chance.sentence() });

      expect(this.postMessageController.calledOnce).to.be.true;
      const args = this.postMessageController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/channels/${this.channel.id}/message`,
      );
      expect(args.get('Authorization')).to.be.a('string');
      expect(args)
        .to.have.nested.property('request.body.body')
        .to.be.a('string');
    });
  });

  describe('GET /channels/:channelId/message', () => {
    it('should call the `getChannelMessagesController`', async function () {
      await request
        .get(`/channels/${this.channel.id}/message`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ body: chance.sentence() });

      expect(this.getChannelMessagesController.calledOnce).to.be.true;
      const args = this.getChannelMessagesController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/channels/${this.channel.id}/message`,
      );
      expect(args.get('Authorization')).to.be.a('string');
    });
  });

  describe('DELETE /channels/:channelId/message/:messageId', () => {
    it('should call the `deleteChannelMessageController`', async function () {
      const messageId = chance.guid();
      await request
        .delete(`/channels/${this.channel.id}/message/${messageId}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({});

      expect(this.deleteChannelMessageController.calledOnce).to.be.true;
      const args = this.deleteChannelMessageController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/channels/${this.channel.id}/message/${messageId}`,
      );
      expect(args.get('Authorization')).to.be.a('string');
      expect(args).to.have.nested.property('params.channelId').to.a('string');
      expect(args).to.have.nested.property('params.messageId').to.a('string');
    });
  });
});
