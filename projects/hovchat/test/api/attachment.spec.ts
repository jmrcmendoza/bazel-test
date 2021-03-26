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

  describe('POST /attachments/:channel', () => {
    it('should call the `uploadAttachmentsController`', async function () {
      await request
        .post(`/attachments/${this.channel}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .attach('file', Buffer.from(chance.sentence()), 'attachment.txt');

      expect(this.uploadAttachmentsController.calledOnce).to.be.true;
      const args = this.uploadAttachmentsController.args[0][0];
      expect(args).to.have.property('path', `/attachments/${this.channel}`);
      expect(args.get('Authorization')).to.be.a('string');
      expect(args).to.have.nested.property('params.channel').to.be.a('string');
      expect(args).to.have.nested.property('files').to.be.an('array');
    });
  });

  describe('GET /attachments/:channel', () => {
    it('should call the `getAttachmentsController`', async function () {
      await request
        .get(`/attachments/${this.channel}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({});

      expect(this.getAttachmentsController.calledOnce).to.be.true;
      const args = this.getAttachmentsController.args[0][0];
      expect(args).to.have.property('path', `/attachments/${this.channel}`);
      expect(args.get('Authorization')).to.be.a('string');
      expect(args).to.have.nested.property('params.channel').to.be.a('string');
    });
  });

  describe('GET /attachments/file/:id', () => {
    it('should call the `getFileController`', async function () {
      const attachment = chance.guid();
      await request
        .get(`/attachments/file/${attachment}`)
        .set('Authorization', `Bearer ${this.authorizationKey}`)
        .send({});

      expect(this.getFileController.calledOnce).to.be.true;
      const args = this.getFileController.args[0][0];
      expect(args).to.have.property('path', `/attachments/file/${attachment}`);
      expect(args.get('Authorization')).to.be.a('string');
      expect(args).to.have.nested.property('params.id').to.be.a('string');
    });
  });
});
