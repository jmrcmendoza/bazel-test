/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  initiateChannelController,
  getChannelsController,
  deleteChannelController,
  getUnreadCountController,
  markAsReadController,
  addReactionController,
  removeReactionController,
} from 'src/controller/channel';
import * as api from 'src/services/api';
import chance from 'test/helpers/chance';
import R from 'ramda';

import Model from 'src/model';
import ChannelStatModel from 'src/model/rethinkdb/channel-stat';

chai.use(chaiAsPromised);

describe('Channel Controller', () => {
  before(async function () {
    await api.start();

    this.integrationKey = chance.guid();

    await Model.Integration.create({ key: this.integrationKey });
  });

  after(async () => {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
    await Model.Channel.deleteMany({});
    await Model.ChannelStat.deleteMany({});
    await api.stop();
  });

  describe('Initiate Channel', () => {
    before(async function () {
      this.personIds = [chance.string(), chance.string(), chance.string()];

      R.times(
        async (i) =>
          await Model.Person.create({
            id: this.personIds[i],
            integration: this.integrationKey,
          }),
        this.personIds.length,
      );

      this.channelId = chance.guid();
      await Model.Channel.create({
        id: this.channelId,
        persons: this.personIds,
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
            persons: this.personIds,
          },
        },
      };

      await expect(initiateChannelController(data))
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
            persons: this.personIds,
          },
        },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith('Integration Key does not exist.')
        .and.to.have.property('name', 'INTEGRATION_KEY_NOT_FOUND');
    });

    it('should throw an error given channel id is not provided', async function () {
      const ids = [chance.string(), chance.string()];
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            persons: ids,
          },
        },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith(`Channel Id must be provided.`)
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should throw an error given channel id already exist', async function () {
      const ids = [chance.string(), chance.string()];
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            id: this.channelId,
            persons: ids,
          },
        },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith(`Channel already exist.`)
        .and.to.have.property('name', 'DUPLICATE_ID_ERROR');
    });

    it('should throw an error given ids does not exist', async function () {
      const ids = [chance.string(), chance.string()];
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            id: chance.guid(),
            persons: ids,
          },
        },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith(`Person IDs does not exist: ${ids}`)
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should throw an error given ids does not exist', async function () {
      const integration = chance.guid();
      await Model.Integration.create({ key: integration });

      const invalidPerson = await Model.Person.create({
        id: chance.guid(),
        integration,
      });

      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            id: chance.guid(),
            persons: [...this.personIds, invalidPerson.id],
          },
        },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith(
          `Person IDs does not exist: ${invalidPerson.id}`,
        )
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should throw an error given persons is not provided', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: { body: { id: chance.guid() } },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith(`Persons must be provided.`)
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should throw an error given one person id is provided', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            id: chance.guid(),
            persons: [chance.guid()],
          },
        },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith(`There should be two or more persons.`)
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should throw an error given one person is deleted', async function () {
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
        request: {
          body: {
            id: chance.guid(),
            persons: [...this.personIds, person.id],
          },
        },
      };

      await expect(initiateChannelController(data))
        .to.eventually.rejectedWith(`Person IDs does not exist: ${person.id}`)
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should return true given inputs are correct', async function () {
      const sandbox = this.sandbox as sinon.SinonSandbox;

      this.createChannelStat = sandbox.spy(
        ChannelStatModel,
        'createChannelStat',
      );

      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        request: {
          body: {
            id: chance.guid(),
            persons: this.personIds,
          },
        },
      };

      const { body } = await initiateChannelController(data);

      expect(body).to.be.true;
      expect(this.createChannelStat.calledOnce).to.be.true;
    });
  });

  describe('Get Channels', () => {
    before(async function () {
      this.personIds = [chance.string(), chance.string(), chance.string()];

      R.times(
        async (i) =>
          await Model.Person.create({
            id: this.personIds[i],
            integration: this.integrationKey,
          }),
        this.personIds.length,
      );

      await Model.Channel.create({
        id: chance.guid(),
        persons: this.personIds,
        integration: this.integrationKey,
      });
    });

    it('should throw an error given null integration key', async function () {
      const data: any = {
        headers: {
          'Content-Type': 'application/json',
        },
        get: () => {
          return null;
        },
      };

      await expect(getChannelsController(data))
        .to.eventually.rejectedWith('Integration Key must be provided.')
        .and.to.have.property('name', 'INVALID_INTEGRATION_KEY_ERROR');
    });

    it('should throw an error given integration key does not exist', async function () {
      const data: any = {
        get: () => {
          return chance.string();
        },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await expect(getChannelsController(data))
        .to.eventually.rejectedWith('Integration Key does not exist.')
        .and.to.have.property('name', 'INTEGRATION_KEY_NOT_FOUND');
    });

    it('should return channels and status of 200', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { body, status } = await getChannelsController(data);

      expect(body).to.be.an('array').that.has.length.greaterThan(0);
      expect(status).to.equal(200);
    });
  });

  describe('Delete Channel', () => {
    before(async function () {
      this.personIds = [chance.string(), chance.string(), chance.string()];

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

    it('should throw an error given null integration key', async function () {
      const data: any = {
        get: () => {
          return null;
        },
        params: { channelId: this.channel.id },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await expect(deleteChannelController(data))
        .to.eventually.rejectedWith('Integration Key must be provided.')
        .and.to.have.property('name', 'INVALID_INTEGRATION_KEY_ERROR');
    });

    it('should throw an error given integration key does not exist', async function () {
      const data: any = {
        get: () => {
          return chance.string();
        },
        params: { channelId: this.channel.id },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await expect(deleteChannelController(data))
        .to.eventually.rejectedWith('Integration Key does not exist.')
        .and.to.have.property('name', 'INTEGRATION_KEY_NOT_FOUND');
    });

    it('should throw an error given channel does not exist', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        params: { channelId: chance.guid() },
        headers: {
          'Content-Type': 'application/json',
          'Integration-Key': this.integrationKey,
        },
      };

      await expect(deleteChannelController(data))
        .to.eventually.rejectedWith('Channel does not exist.')
        .and.to.have.property('name', 'CHANNEL_NOT_FOUND');
    });

    it('should delete channel and return true', async function () {
      const data: any = {
        get: () => {
          return this.integrationKey;
        },
        params: { channelId: this.channel.id },
        headers: {
          'Content-Type': 'application/json',
          'Integration-Key': this.integrationKey,
        },
      };

      const { body, status } = await deleteChannelController(data);

      expect(body).to.be.true;
      expect(status).to.equal(200);
    });
  });

  describe('Get Unread Count', () => {
    before(async function () {
      this.personIds = [chance.string(), chance.string(), chance.string()];

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

      await ChannelStatModel.createChannelStat(this.channel.id, this.personIds);
    });

    it('should retrieve unread count', async function () {
      const data: any = {
        headers: {
          'Content-Type': 'application/json',
          'Integration-Key': this.integrationKey,
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      const { body, status } = await getUnreadCountController(data);

      expect(body).to.be.an('object');
      expect(status).to.equal(200);
    });
  });

  describe('Mark as Read', () => {
    before(async function () {
      this.personIds = [chance.string(), chance.string(), chance.string()];

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

      await ChannelStatModel.createChannelStat(this.channel.id, this.personIds);
    });

    it('should return true given inputs are correct', async function () {
      const data: any = {
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      const { body, status } = await markAsReadController(data);

      expect(body).to.be.true;
      expect(status).to.equal(200);
    });
  });

  describe('Add React', () => {
    before(async function () {
      this.personIds = [chance.string(), chance.string(), chance.string()];

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

      await Model.Message.create({
        body: chance.sentence(),
        integration: this.integrationKey,
        channel: this.channel.id,
        sender: this.personIds[0],
      });

      this.message = await Model.Message.findOne({});
    });

    it('should throw an error given message is not provided', async function () {
      const data: any = {
        params: {},
        request: { body: { reaction: ':like:' } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      await expect(addReactionController(data))
        .to.eventually.rejectedWith('Message ID must be provided.')
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should throw an error given message does not exist', async function () {
      const data: any = {
        params: { messageId: chance.guid() },
        request: { body: { reaction: ':like:' } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      await expect(addReactionController(data))
        .to.eventually.rejectedWith('Message does not exist.')
        .and.to.have.property('name', 'MESSAGE_NOT_FOUND');
    });

    it('should return true given all input are correct', async function () {
      const reaction = ':like:';
      const data: any = {
        params: { messageId: this.message.id },
        request: { body: { reaction } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      const { body } = await addReactionController(data);

      expect(body).to.be.true;

      const message = await Model.Message.findById(this.message.id);

      expect(message?.reactions[reaction]).to.exist;
      expect(message?.reactions[reaction]).includes(this.personIds[0]);
    });
  });

  describe('Remove React', () => {
    before(async function () {
      this.personIds = [chance.string(), chance.string(), chance.string()];

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

      await Model.Message.create({
        body: chance.sentence(),
        integration: this.integrationKey,
        channel: this.channel.id,
        sender: this.personIds[0],
      });

      this.message = await Model.Message.findOne({});
    });

    it('should throw an error given message is not provided', async function () {
      const data: any = {
        params: {},
        request: { body: { reaction: ':like:' } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      await expect(removeReactionController(data))
        .to.eventually.rejectedWith('Message ID must be provided.')
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should throw an error given message does not exist', async function () {
      const data: any = {
        params: { messageId: chance.guid() },
        request: { body: { reaction: ':like:' } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      await expect(removeReactionController(data))
        .to.eventually.rejectedWith('Message does not exist.')
        .and.to.have.property('name', 'MESSAGE_NOT_FOUND');
    });

    it('should return true given all input are correct', async function () {
      const reaction = ':like:';
      const data: any = {
        params: { messageId: this.message.id },
        request: { body: { reaction } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
          channel: this.channel,
        },
      };

      await addReactionController(data);

      const { body } = await removeReactionController(data);

      expect(body).to.be.true;

      const message = await Model.Message.findById(this.message.id);

      expect(message?.reactions[reaction]).to.exist;
      expect(message?.reactions[reaction]).not.includes(this.personIds[0]);
    });
  });
});
