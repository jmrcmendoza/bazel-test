/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chance from 'test/helpers/chance';
import R from 'ramda';

import Model from 'src/model';

import * as api from 'src/services/api';
import sinon from 'sinon';
import { channelValidations } from 'src/library/channel-validations';

chai.use(chaiAsPromised);

describe('Validations', () => {
  before(async function () {
    await api.start();

    this.integrationKey = chance.guid();

    await Model.Integration.create({ key: this.integrationKey });

    this.personId = [chance.string(), chance.string(), chance.string()];

    R.times(
      async (i) =>
        await Model.Person.create({
          id: this.personIds[i],
          integration: this.integrationKey,
        }),
      this.personId.length,
    );

    this.channel = await Model.Channel.create({
      id: chance.guid(),
      persons: this.personId,
      integration: this.integrationKey,
    });
  });

  after(async () => {
    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
    await Model.Channel.deleteMany({});
    await api.stop();
  });

  describe('Channel Validations', () => {
    it('should throw an error given channel is not provided', async function () {
      const nextSpy = sinon.spy();

      const data: any = {
        params: {},
        state: {
          person: { id: this.personId[0] },
        },
      };

      const result = await channelValidations(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Channel ID must be provided.',
      );
    });

    it('should throw an error given channel does not exist', async function () {
      const nextSpy = sinon.spy();

      const data: any = {
        params: { channelId: chance.guid() },
        state: {
          person: { id: this.personId[0] },
        },
      };

      const result = await channelValidations(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Channel does not exist.',
      );
    });

    it('should throw an error given person is not member of the channel', async function () {
      const nextSpy = sinon.spy();

      const data: any = {
        params: { channelId: this.channel.id },
        state: {
          person: { id: chance.guid() },
        },
      };

      const result = await channelValidations(data, nextSpy);

      expect(result).to.have.property('status', 401);
      expect(result).to.have.nested.property(
        'body.error',
        'Person not a member of the channel.',
      );
    });

    it('should call next() once given channel is valid', async function () {
      const nextSpy = sinon.spy();

      const data: any = {
        params: { channelId: this.channel.id },
        state: {
          person: { id: this.personId[0] },
        },
      };

      await channelValidations(data, nextSpy);

      expect(nextSpy.calledOnce).to.be.true;
    });
  });
});
