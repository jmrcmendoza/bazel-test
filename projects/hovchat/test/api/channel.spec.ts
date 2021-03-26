/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';

import chance from 'test/helpers/chance';
import request from 'test/helpers/request';

import Model from 'src/model';

import 'test/api/common';
import { create } from 'src/library/auth';

describe('Channel API', () => {
  before(async function () {
    this.integrationKey = chance.guid();

    await Model.Integration.create({ key: this.integrationKey });

    this.sender = chance.guid();
    this.recipient = chance.guid();

    await Model.Person.create({
      id: this.sender,
      integration: this.integrationKey,
    });

    this.channel = await Model.Channel.create({
      id: chance.guid(),
      persons: [this.sender, chance.guid()],
      integration: this.integrationKey,
    });

    await Model.Message.create({
      body: chance.sentence(),
      integration: this.integrationKey,
      channel: this.channel.id,
      sender: this.sender,
    });

    this.message = await Model.Message.findOne({});

    this.authorizationKey = await create({
      integrationKey: this.integrationKey,
      person: this.sender,
    });
  });

  after(async function () {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
    await Model.Message.deleteMany({});
  });

  describe('POST /channels', () => {
    it('should call the `initiateChannelController`', async function () {
      await request
        .post('/channels')
        .send({ persons: [chance.guid(), chance.guid()] });

      expect(this.initiateChannelController.calledOnce).to.be.true;
      const args = this.initiateChannelController.args[0][0];
      expect(args).to.have.property('path', '/channels');
      expect(args.get('Integration-Key')).to.be.a('string');
      expect(args)
        .to.have.nested.property('request.body.persons')
        .to.be.an('array');
    });
  });

  describe('GET /channels', () => {
    it('should call the `getChannelsController`', async function () {
      await request.get('/channels').send({});

      expect(this.getChannelsController.calledOnce).to.be.true;
      const args = this.getChannelsController.args[0][0];
      expect(args).to.have.property('path', '/channels');
      expect(args.get('Integration-Key')).to.be.a('string');
    });
  });

  describe('DELETE /channels/:channelId', () => {
    it('should call the `deleteChannelController`', async function () {
      const channel = chance.guid();
      await request.delete(`/channels/${channel}`).send({});

      expect(this.deleteChannelController.calledOnce).to.be.true;
      const args = this.deleteChannelController.args[0][0];
      expect(args).to.have.property('path', `/channels/${channel}`);
      expect(args).to.have.nested.property('params.channelId').to.a('string');
      expect(args.get('Integration-Key')).to.be.a('string');
    });
  });

  describe('GET /channels/:channelId/unread-count', () => {
    it('should call the `getUnreadCountController`', async function () {
      await request
        .get(`/channels/${this.channel.id}/unread-count`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({});

      expect(this.getUnreadCountController.calledOnce).to.be.true;
      const args = this.getUnreadCountController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/channels/${this.channel.id}/unread-count`,
      );
      expect(args).to.have.nested.property('params.channelId').to.a('string');
      expect(args.get('Authorization')).to.be.a('string');
    });
  });

  describe('PUT /channels/:channelId', () => {
    it('should call the `markAsReadController`', async function () {
      await request
        .put(`/channels/${this.channel.id}/mark-read`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({});

      expect(this.markAsReadController.calledOnce).to.be.true;
      const args = this.markAsReadController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/channels/${this.channel.id}/mark-read`,
      );
      expect(args).to.have.nested.property('params.channelId').to.a('string');
      expect(args.get('Authorization')).to.be.a('string');
    });
  });

  describe('PUT /channels/:channelId/message/:messageId/react', () => {
    it('should call the `addReactionController`', async function () {
      await request
        .put(`/channels/${this.channel.id}/message/${this.message.id}/react`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ name: ':like:' });

      expect(this.addReactionController.calledOnce).to.be.true;
      const args = this.addReactionController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/channels/${this.channel.id}/message/${this.message.id}/react`,
      );
      expect(args).to.have.nested.property('params.channelId').to.a('string');
      expect(args).to.have.nested.property('params.messageId').to.a('string');
      expect(args).to.have.nested.property('request.body.name').to.a('string');
      expect(args.get('Authorization')).to.be.a('string');
    });
  });

  describe('PUT /channels/:channelId/message/:messageId/react', () => {
    it('should call the `removeReactionController`', async function () {
      await request
        .delete(`/channels/${this.channel.id}/message/${this.message.id}/react`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({ name: ':like:' });

      expect(this.removeReactionController.calledOnce).to.be.true;
      const args = this.removeReactionController.args[0][0];
      expect(args).to.have.property(
        'path',
        `/channels/${this.channel.id}/message/${this.message.id}/react`,
      );
      expect(args).to.have.nested.property('params.channelId').to.a('string');
      expect(args).to.have.nested.property('params.messageId').to.a('string');
      expect(args).to.have.nested.property('request.body.name').to.a('string');
      expect(args.get('Authorization')).to.be.a('string');
    });
  });
});
