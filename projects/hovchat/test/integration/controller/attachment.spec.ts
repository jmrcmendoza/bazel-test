/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  getAttachmentsController,
  getFileController,
  uploadAttachmentsController,
} from 'src/controller/attachments';
import request from 'test/helpers/request';

import * as api from 'src/services/api';
import chance from 'test/helpers/chance';
import R from 'ramda';

import Model from 'src/model';
import { create } from 'src/library/auth';
import { middleware } from 'src/controller/attachments/get-file';

chai.use(chaiAsPromised);

describe('Attachment Controller', () => {
  before(async function () {
    await api.start();

    this.personIds = [chance.string(), chance.string()];
    this.integrationKey = chance.guid();

    await Model.Integration.create({ key: this.integrationKey });

    R.times(
      async (i) =>
        await Model.Person.create({
          id: this.personIds[i],
          integration: this.integrationKey,
        }),
      this.personIds.length,
    );

    this.channel = await Model.Channel.create({
      id: chance.guid(),
      persons: this.personIds,
      integration: this.integrationKey,
    });
  });

  after(async () => {
    await Model.Person.deleteMany({});
    await Model.Message.deleteMany({});
    await Model.Channel.deleteMany({});
    await Model.Attachment.deleteMany({});
    await api.stop();
  });

  describe('Upload Attachments', () => {
    it('should throw new error given channel does not exist', async function () {
      const data: any = {
        params: { channel: chance.guid() },
        files: [
          {
            filename: chance.word(),
            path: chance.avatar({ fileExtension: 'jpg' }),
          },
        ],
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(uploadAttachmentsController(data))
        .to.eventually.rejectedWith('Channel does not exist.')
        .and.to.have.property('name', 'CHANNEL_NOT_FOUND');
    });

    it('should throw new error given files failed to upload', async function () {
      const data: any = {
        params: { channel: this.channel.id },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(uploadAttachmentsController(data))
        .to.eventually.rejectedWith('Upload failed.')
        .and.to.have.property('name', 'UPLOAD_ERROR');
    });

    it('should return the ids of the attachments', async function () {
      const data: any = {
        params: { channel: this.channel.id },
        files: [
          {
            filename: chance.word(),
            path: chance.avatar({ fileExtension: 'jpg' }),
          },
        ],
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };
      const { body } = await uploadAttachmentsController(data);

      expect(body).to.be.an('array');
    });
  });

  describe('Get Attachments', () => {
    before(async function () {
      R.times(
        async () =>
          await Model.Attachment.create({
            filename: chance.word(),
            path: chance.word(),
            person: this.personIds[0],
            channel: this.channel.id,
            integration: this.integrationKey,
          }),
        2,
      );
    });

    it('should throw an error given channel does not exist', async function () {
      const data: any = {
        params: { channel: chance.guid() },
        query: {},
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(uploadAttachmentsController(data))
        .to.eventually.rejectedWith('Channel does not exist.')
        .and.to.have.property('name', 'CHANNEL_NOT_FOUND');
    });

    it('should retrieve the attachments', async function () {
      const data: any = {
        params: { channel: this.channel.id },
        query: {},
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };
      const { body } = await getAttachmentsController(data);

      expect(body.edges).to.be.an('array');
    });
  });

  describe('Get File', () => {
    before(async function () {
      const authorization = await create({
        integrationKey: this.integrationKey,
        person: this.personIds[0],
      });

      await request
        .post(`/attachments/${this.channel.id}`)
        .set('Authorization', `Bearer ${authorization}`)
        .attach('file', Buffer.from(chance.sentence()), 'attachment.txt');

      this.attachment = await Model.Attachment.findOne({});
    });

    it('should not call send function given channel attachment not exist', async function () {
      const sendSpy = this.sandbox.stub(middleware, 'send');

      await getFileController({ params: { id: chance.guid() } } as any);

      expect(sendSpy.called).to.be.false;

      sendSpy.restore();
    });

    it('should call `send` function once', async function () {
      const sendSpy = this.sandbox.stub(middleware, 'send');

      await getFileController({ params: { id: this.attachment.id } } as any);

      expect(sendSpy.calledOnce).to.be.true;

      sendSpy.restore();
    });
  });
});
