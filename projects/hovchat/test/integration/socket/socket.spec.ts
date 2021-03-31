/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import pWaitFor from 'p-wait-for';
import { io, Socket } from 'socket.io-client';
import sinon from 'sinon';
import deepEqual from 'deep-equal';
import R from 'ramda';

import { Message } from 'src/types/common';
import { create } from 'src/library/auth';
import chance from 'test/helpers/chance';
import Model from 'src/model';
import * as socketService from 'src/services/socketio';
import Notification from 'src/notification';

import '../common';

const socketUrl = `ws://localhost:${process.env.SOCKET_PORT || 8001}`;

describe('Socket.IO', function () {
  before(async function () {
    await socketService.start();
  });

  after(async function () {
    await socketService.stop();

    await Model.Integration.deleteMany({});
    await Model.Person.deleteMany({});
  });

  describe('#connection', function () {
    describe('GIVEN there token is provided upon connecting', function () {
      beforeEach(async function () {
        const sandbox = this.sandbox as sinon.SinonSandbox;

        const key = chance.guid();

        await Model.Integration.create({ key });

        this.person = chance.guid();

        this.token = await create({
          integrationKey: key,
          person: this.person,
        });

        this.createPersonSpy = sandbox.spy(Model.Person, 'create');

        this.updatePersonSpy = sandbox.spy(Model.Person, 'findByIdAndUpdate');
      });

      afterEach(function () {
        this.sandbox.restore();
      });

      describe('GIVEN integration key is valid', function () {
        beforeEach(async function () {
          const socket = io(socketUrl, {
            auth: { token: this.token },
          });

          this.socket = socket;
          this.connectStub = (this.sandbox as sinon.SinonSandbox).stub();
          this.messageStub = (this.sandbox as sinon.SinonSandbox).stub();
          this.disconnectStub = (this.sandbox as sinon.SinonSandbox).stub();

          socket.on('connect', this.connectStub);
          socket.on('message', this.messageStub);
          socket.on('disconnect', this.disconnectStub);
        });

        afterEach(function () {
          this.socket.close();
        });

        it('SHOULD be able to connect AND return ok to TRUE, WHEN integration key exists', async function () {
          await expect(pWaitFor(() => this.connectStub.calledOnce)).to
            .eventually.be.not.rejected;

          await expect(pWaitFor(() => this.messageStub.args[0][0].ok)).to
            .eventually.be.not.rejected;
        });

        it('SHOULD create the person, WHEN the person does not exist yet', async function () {
          await expect(
            pWaitFor(() =>
              Model.Person.findById(this.person).then((p) => !!p as boolean),
            ),
          ).to.eventually.be.not.rejected;

          expect(this.createPersonSpy.calledOnce).to.be.true;
        });

        it('SHOULD updated person, WHEN socket is disconnected', async function () {
          await expect(pWaitFor(() => this.connectStub.calledOnce)).to
            .eventually.be.not.rejected;

          await pWaitFor(() => this.messageStub.calledOnce);

          await this.socket.close();

          await expect(pWaitFor(() => this.disconnectStub.calledOnce)).to
            .eventually.be.not.rejected;

          await expect(pWaitFor(() => this.updatePersonSpy.calledTwice)).to
            .eventually.be.not.rejected;
        });
      });

      describe('GIVEN integration key is not valid', function () {
        beforeEach(async function () {
          this.token = await create({
            integrationKey: chance.guid(),
            person: this.person,
          });

          const socket = io(socketUrl, {
            auth: { token: this.token },
          });

          this.socket = socket;
          this.messageStub = (this.sandbox as sinon.SinonSandbox).stub();

          this.disconnectStub = (this.sandbox as sinon.SinonSandbox).stub();
          socket.on('message', this.messageStub);
          socket.on('disconnect', this.disconnectStub);
        });

        afterEach(function () {
          this.socket.close();
        });

        it('SHOULD return ok to FALSE AND disconnect the socket', async function () {
          await expect(pWaitFor(() => this.disconnectStub.calledOnce)).to
            .eventually.be.not.rejected;

          await expect(pWaitFor(() => this.messageStub.args[0][0].ok === false))
            .to.eventually.be.not.rejected;
        });
      });
    });

    describe('GIVEN there is no token being provided', function () {
      beforeEach(async function () {
        const socket = io(socketUrl);

        this.socket = socket;
        this.messageStub = (this.sandbox as sinon.SinonSandbox).stub();

        this.disconnectStub = (this.sandbox as sinon.SinonSandbox).stub();
        socket.on('message', this.messageStub);
        socket.on('disconnect', this.disconnectStub);

        await create({
          integrationKey: chance.guid(),
          person: chance.guid(),
        });
      });

      afterEach(function () {
        this.socket.close();
      });

      it('SHOULD disconnect the connection AND return ok to FALSE', async function () {
        await expect(pWaitFor(() => this.disconnectStub.calledOnce)).to
          .eventually.be.not.rejected;

        await expect(pWaitFor(() => this.messageStub.args[0][0].ok === false))
          .to.eventually.be.not.rejected;
      });
    });
  });

  describe('GIVEN valid authentication has been provided', function () {
    before(async function () {
      const key = chance.guid();

      await Model.Integration.create({ key });

      this.person = chance.guid();

      this.token = await create({
        integrationKey: key,
        person: this.person,
      });

      const socket = io(socketUrl, {
        auth: { token: this.token },
      });

      this.socket = socket;
      this.messageStub = (this.sandbox as sinon.SinonSandbox).stub();
      this.messageCreatedStub = (this.sandbox as sinon.SinonSandbox).stub();

      socket.on('message', this.messageStub);
      socket.on('messageCreated', this.messageCreatedStub);
    });

    after(function () {
      this.socket.close();
    });

    describe('#subscribe', function () {
      it('SHOULD be able to subscribe to the channel AND received the message GIVEN channel exists', async function () {
        await pWaitFor(() => this.messageStub.calledOnce);

        const channel = chance.guid();
        await Model.Channel.create({
          id: channel,
          persons: [this.person],
        } as any);

        await expect(
          new Promise((resolve) => {
            this.socket.emit(
              'subscribe',
              channel,
              (response: { ok: boolean }) => resolve(response.ok),
            );
          }),
        ).to.eventually.be.true;

        const message: Message = {
          id: chance.guid(),
          body: chance.sentence(),
          channel,
          sender: this.person,
        } as any;

        Notification.emit('messageCreated', message);

        await expect(
          pWaitFor(() =>
            deepEqual(R.path(['args', 0, 0], this.messageCreatedStub), message),
          ),
        ).to.eventually.be.not.rejected;
      });

      it('SHOULD return an error and not ok GIVEN channel does not exist', async function () {
        await expect(
          new Promise((resolve) => {
            this.socket.emit(
              'subscribe',
              chance.guid(),
              (response: { ok: boolean }) => resolve(response.ok),
            );
          }),
        ).to.eventually.be.false;
      });

      it('SHOULD return an error and not ok GIVEN person is not included in channel', async function () {
        const channel = chance.guid();
        await Model.Channel.create({
          id: channel,
          persons: [],
        } as any);

        await expect(
          new Promise((resolve) => {
            this.socket.emit(
              'subscribe',
              channel,
              (response: { ok: boolean }) => resolve(response.ok),
            );
          }),
        ).to.eventually.be.false;
      });
    });

    describe('#unsubscribe', function () {
      it('SHOULD not receive any more messages after unsubscribing', async function () {
        const channel = chance.guid();
        await Model.Channel.create({
          id: channel,
          persons: [this.person],
        } as any);

        await new Promise((resolve) =>
          this.socket.emit('subscribe', channel, (response: { ok: boolean }) =>
            resolve(response.ok),
          ),
        );

        await expect(
          new Promise((resolve) =>
            this.socket.emit(
              'unsubscribe',
              channel,
              (response: { ok: boolean }) => resolve(response.ok),
            ),
          ),
        ).to.eventually.be.true;
      });

      it('SHOULD return ok FALSE WHEN already not subscribing', async function () {
        await expect(
          new Promise((resolve) =>
            this.socket.emit(
              'unsubscribe',
              chance.guid(),
              (response: { ok: boolean }) => resolve(response.ok),
            ),
          ),
        ).to.eventually.be.false;
      });
    });

    describe('#events', function () {
      beforeEach(async function () {
        const channel = {
          id: chance.guid(),
          persons: [this.person],
        };

        this.channel = channel;

        await Model.Channel.create(channel as any);

        this.message = {
          id: chance.guid(),
          body: chance.sentence(),
          channel: channel.id,
          sender: this.person,
        } as any;

        const socket = this.socket as Socket;

        await expect(
          new Promise((resolve) =>
            this.socket.emit(
              'subscribe',
              channel.id,
              (response: { ok: boolean }) => resolve(response.ok),
            ),
          ),
        ).to.eventually.be.true;

        this.messageCreatedStub = (this.sandbox as sinon.SinonSandbox).stub();
        this.messageUpdatedStub = (this.sandbox as sinon.SinonSandbox).stub();
        this.messageDeletedStub = (this.sandbox as sinon.SinonSandbox).stub();

        this.channelUpdatedStub = (this.sandbox as sinon.SinonSandbox).stub();
        this.channelDeletedStub = (this.sandbox as sinon.SinonSandbox).stub();

        socket.on('messageCreated', this.messageCreatedStub);
        socket.on('messageUpdated', this.messageUpdatedStub);
        socket.on('messageDeleted', this.messageDeletedStub);
        socket.on('channelUpdated', this.channelUpdatedStub);
        socket.on('channelDeleted', this.channelDeletedStub);
        socket.on('personUpdated', this.channelDeletedStub);
      });

      afterEach(function () {
        this.sandbox.resetHistory();
      });

      it('SHOULD receive "messageCreated" event', async function () {
        Notification.emit('messageCreated', this.message);

        await expect(pWaitFor(() => this.messageCreatedStub.calledOnce)).to
          .eventually.be.not.rejected;
      });

      it('SHOULD receive "messageUpdated" event', async function () {
        Notification.emit('messageUpdated', this.message);

        await expect(pWaitFor(() => this.messageUpdatedStub.calledOnce)).to
          .eventually.be.not.rejected;
      });
      it('SHOULD receive "messageDeleted" event', async function () {
        Notification.emit('messageDeleted', this.message);

        await expect(pWaitFor(() => this.messageDeletedStub.calledOnce)).to
          .eventually.be.not.rejected;
      });

      it('SHOULD receive "channelUpdated" event', async function () {
        Notification.emit('channelUpdated', this.channel);

        await expect(pWaitFor(() => this.channelUpdatedStub.calledOnce)).to
          .eventually.be.not.rejected;
      });

      it('SHOULD not receive anymore message WHEN channel is updated and person is not included anymore', async function () {
        Notification.emit('channelUpdated', { ...this.channel, persons: [] });

        await pWaitFor(() => this.channelUpdatedStub.calledOnce);

        Notification.emit('messageCreated', this.message);

        await expect(
          pWaitFor(() => this.messageCreatedStub.calledOnce, { timeout: 100 }),
        ).to.eventually.be.rejected;
      });

      it('SHOULD receive "channelDeleted" event', async function () {
        Notification.emit('channelDeleted', this.channel);

        await expect(
          pWaitFor(() => this.channelDeletedStub.calledOnce, { timeout: 1000 }),
        ).to.eventually.be.not.rejected;
      });

      it('SHOULD not receive anymore message WHEN channel is deleted', async function () {
        Notification.emit('channelDeleted', this.channel);

        await pWaitFor(() => this.channelDeletedStub.calledOnce, {
          timeout: 1000,
        });

        Notification.emit('messageCreated', this.message);

        await expect(
          pWaitFor(() => this.messageCreatedStub.calledOnce, { timeout: 1000 }),
        ).to.eventually.be.rejected;
      });

      it('SHOULD receive "personUpdated" event', async function () {
        Notification.emit('personUpdated', this.channel);

        await expect(
          pWaitFor(() => this.personUpdatedStub.calledOnce, { timeout: 1000 }),
        ).to.eventually.be.not.rejected;
      });
    });
  });
});
