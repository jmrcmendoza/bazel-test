/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  deleteDirectMessagesController,
  getDirectMessagesController,
  postDirectMessageController,
} from 'src/controller/direct-message';

import * as api from 'src/services/api';
import chance from 'test/helpers/chance';
import R from 'ramda';

import Model from 'src/model';
import ChannelStatModel from 'src/model/rethinkdb/channel-stat';
import ContactModel from 'src/model/rethinkdb/contact';

chai.use(chaiAsPromised);

describe('Direct Message Controller', () => {
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
  });

  after(async () => {
    await Model.Person.deleteMany({});
    await Model.Message.deleteMany({});
    await Model.ChannelStat.deleteMany({});
    await Model.Integration.deleteMany({});
    await Model.Contact.deleteMany({});
    await api.stop();
  });

  describe('Post Direct Message', () => {
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

      this.addContactSpy = sandbox.spy(ContactModel, 'addContact');
    });

    after(function () {
      this.incrementUnreadCount.restore();
    });

    it('should thrown an error given recipient does not exist', async function () {
      const data: any = {
        params: { recipient: chance.guid() },
        request: { body: { body: chance.sentence() } },
        query: {},
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(postDirectMessageController(data))
        .to.eventually.rejectedWith('Recipient does not exist.')
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should thrown an error given message is not provided', async function () {
      const data: any = {
        params: { recipient: this.personIds[1] },
        request: { body: {} },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(postDirectMessageController(data))
        .to.eventually.rejectedWith('Message must be provided.')
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should return true given inputs are correct', async function () {
      const data: any = {
        params: { recipient: this.personIds[1] },
        request: { body: { body: chance.sentence(), attachments: [] } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      const { body } = await postDirectMessageController(data);

      expect(body).to.be.true;
      expect(this.addContactSpy.called).to.be.false;
      expect(this.incrementUnreadCount.calledOnce).to.be.true;
    });

    it('should call `addContact` given allowed to add contact', async function () {
      const integration = chance.guid();
      const persons = [chance.guid(), chance.guid()];

      R.times(
        async (i) =>
          await Model.Person.create({
            id: persons[i],
            integration,
          }),
        persons.length,
      );

      await Model.Integration.create({ key: integration, contacts: true });

      await Model.Contact.create({
        person: persons[1],
        integration,
        contacts: [],
      });

      const data: any = {
        params: { recipient: persons[0] },
        request: { body: { body: chance.sentence(), attachments: [] } },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: persons[1] },
          integration: { key: integration, contacts: true },
        },
      };
      const { body } = await postDirectMessageController(data);

      expect(body).to.be.true;
      expect(this.addContactSpy.calledOnce).to.be.true;
    });
  });

  describe('Get Direct Message', () => {
    before(async function () {
      await Model.Message.deleteMany({});

      const channel = R.reduce(
        (acc: string, value: string) => {
          if (acc) {
            return `${acc}:${value}`;
          }
          return value;
        },
        '',
        R.sortBy(R.identity)(this.personIds),
      );

      R.times(
        async () =>
          await Model.Message.create({
            body: chance.sentence(),
            sender: this.personIds[0],
            channel,
            integration: this.integrationKey,
          }),
        4,
      );
    });

    it('should thrown an error given recipient does not exist', async function () {
      const data: any = {
        params: { recipient: chance.guid() },
        request: { body: { body: chance.sentence() } },
        query: {},
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(getDirectMessagesController(data))
        .to.eventually.rejectedWith('Recipient does not exist.')
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should return messages given inputs are correct', async function () {
      const data: any = {
        params: { recipient: this.personIds[1] },
        request: { body: {} },
        query: {},
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      const { body } = await getDirectMessagesController(data);

      expect(body.edges).to.be.an('array').that.has.length.greaterThan(0);
    });

    it('should return 2 messages and hasNextPage is true given the query is retrieve first 2', async function () {
      const data: any = {
        params: { recipient: this.personIds[1] },
        request: { body: {} },
        query: { first: 2 },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      const { body } = await getDirectMessagesController(data);

      expect(body.edges).to.be.an('array').that.has.length.greaterThan(0);
      expect(body).to.have.property('totalCount', 2);
      expect(body).to.have.nested.property('pageInfo.hasNextPage', true);
    });
  });

  describe('Delete Direct Message', () => {
    beforeEach(async function () {
      const channel = R.reduce(
        (acc: string, value: string) => {
          if (acc) {
            return `${acc}:${value}`;
          }
          return value;
        },
        '',
        R.sortBy(R.identity)([this.personIds]),
      );

      await Model.Message.create({
        body: chance.sentence(),
        sender: this.personIds[0],
        channel,
        integration: this.integrationKey,
      });

      this.message = await Model.Message.findOne({});
    });

    it('should thrown an error given recipient does not exist', async function () {
      const data: any = {
        params: { recipient: chance.guid(), message: this.message.id },
        request: { body: {} },
        query: {},
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(deleteDirectMessagesController(data))
        .to.eventually.rejectedWith('Recipient does not exist.')
        .and.to.have.property('name', 'PERSON_NOT_FOUND');
    });

    it('should thrown an error given message is not provided', async function () {
      const data: any = {
        params: { recipient: this.personIds[0] },
        request: { body: {} },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(deleteDirectMessagesController(data))
        .to.eventually.rejectedWith('Message id must be provided.')
        .and.to.have.property('name', 'INVALID_INPUT_ERROR');
    });

    it('should thrown an error given message is does not exist', async function () {
      const data: any = {
        params: { recipient: this.personIds[0], message: chance.guid() },
        request: { body: {} },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[0] },
          integration: { key: this.integrationKey },
        },
      };

      await expect(deleteDirectMessagesController(data))
        .to.eventually.rejectedWith('Message does not exist.')
        .and.to.have.property('name', 'MESSAGE_NOT_FOUND');
    });

    it('should return messages given inputs are correct', async function () {
      const data: any = {
        params: { recipient: this.personIds[0], message: this.message.id },
        request: { body: {} },
        headers: {
          'Content-Type': 'application/json',
        },
        state: {
          person: { id: this.personIds[1] },
          integration: { key: this.integrationKey },
        },
      };

      const { body } = await deleteDirectMessagesController(data);

      expect(body).to.be.true;
    });
  });
});
