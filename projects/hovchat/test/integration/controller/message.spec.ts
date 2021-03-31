/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  deleteChannelMessageController,
  getChannelMessagesController,
  postMessageController,
} from 'src/controller/message';

import * as api from 'src/services/api';
import chance from 'test/helpers/chance';
import R from 'ramda';

import Model from 'src/model';
import ChannelStatModel from 'src/model/rethinkdb/channel-stat';

chai.use(chaiAsPromised);

describe('Message Controller', () => {
  before(async function () {
    await api.start();

    this.personIds = [chance.string(), chance.string()];
    this.integrationKey = chance.guid();

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

    this.channel = await Model.Channel.findOne({});
  });

  after(async () => {
    await Model.Person.deleteMany({});
    await Model.Message.deleteMany({});
    await Model.Channel.deleteMany({});
    await Model.ChannelStat.deleteMany({});
    await api.stop();
  });

  describe('Post Message', () => {
    before(async function () {
      this.invalidPerson = await Model.Person.create({
        id: chance.guid(),
        integration: this.integrationKey,
      });

      const sandbox = this.sandbox as sinon.SinonSandbox;

      this.incrementUnreadCount = sandbox.spy(
        ChannelStatModel,
        'incrementUnreadCount',
      );
    });

    after(function () {
      this.incrementUnreadCount.restore();
    });

    it('should return true given inputs are correct', async function () {
      const data: any = {
        params: { channelId: this.channel.id },
        request: {
          body: {
            body: chance.sentence(),
            attachments: [],
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey[0] },
          channel: this.channel,
        },
      };

      const { body } = await postMessageController(data);

      expect(body).to.be.true;
      expect(this.incrementUnreadCount.calledOnce).to.be.true;
    });
  });

  describe('Get Channel Message', () => {
    before(async function () {
      await Model.Message.deleteMany({});

      R.times(
        async () =>
          await Model.Message.create({
            body: chance.sentence(),
            sender: this.personIds[0],
            channel: this.channel.id,
            integration: this.integrationKey,
          }),
        4,
      );
    });

    it('should return messages given inputs are correct', async function () {
      const data: any = {
        params: { channelId: this.channel.id },
        request: { body: {} },
        query: {},
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey[0] },
          channel: this.channel,
        },
      };

      const { body } = await getChannelMessagesController(data);

      expect(body.edges).to.be.an('array').that.has.length.greaterThan(0);
    });

    it('should return 2 messages and hasNextPage is true given the query is retrieve first 2', async function () {
      const data: any = {
        params: { channelId: this.channel.id },
        request: { body: {} },
        query: { first: 2 },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey[0] },
          channel: this.channel,
        },
      };

      const { body } = await getChannelMessagesController(data);

      expect(body.edges).to.be.an('array').that.has.length.greaterThan(0);
      expect(body).to.have.property('totalCount', 2);
      expect(body).to.have.nested.property('pageInfo.hasNextPage', true);
    });
  });

  describe('Delete Channel Message', () => {
    beforeEach(async function () {
      await Model.Message.create({
        body: chance.sentence(),
        sender: this.personIds[0],
        channel: this.channel.id,
        integration: this.integrationKey,
      });

      this.message = await Model.Message.findOne({});
    });

    it('should thrown an error given message is not provided.', async function () {
      const data: any = {
        params: {},
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey[0] },
          channel: this.channel,
        },
      };

      await expect(deleteChannelMessageController(data))
        .to.eventually.rejectedWith('Message ID must be provided.')
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should thrown an error given message does not exist', async function () {
      const data: any = {
        params: { messageId: chance.guid() },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey[0] },
          channel: this.channel,
        },
      };

      await expect(deleteChannelMessageController(data))
        .to.eventually.rejectedWith('Message does not exist.')
        .and.to.have.property('name', 'MESSAGE_NOT_FOUND');
    });

    it('should return true given inputs are correct', async function () {
      const data: any = {
        params: { messageId: this.message.id },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey[0] },
          channel: this.channel,
        },
      };

      const { body } = await deleteChannelMessageController(data);

      expect(body).to.be.true;
    });
  });
});
