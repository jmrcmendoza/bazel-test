import sinon from 'sinon';
import * as getChannelsController from 'src/controller/channel/get-channels';
import * as deleteChannelController from 'src/controller/channel/delete-channel';
import * as initiateChannelController from 'src/controller/channel/initiate-channel';
import * as getChannelMessagesController from 'src/controller/message/get-channel-messages';
import * as deleteChannelMessageController from 'src/controller/message/delete-channel-message';

import * as postMessageController from 'src/controller/message/post-message';
import * as createPersonController from 'src/controller/person/create-person';
import * as deletePersonController from 'src/controller/person/delete-person';
import * as updatePersonController from 'src/controller/person/update-person';
import * as authenticateController from 'src/controller/authentication/authenticate';
import * as getDirectMessagesController from 'src/controller/direct-message/get-direct-messages';
import * as postDirectMessageController from 'src/controller/direct-message/post-direct-message';
import * as deleteDirectMessageController from 'src/controller/direct-message/delete-direct-message';
import * as addContactController from 'src/controller/contacts/add-contact';
import * as getContactsController from 'src/controller/contacts/get-contacts';
import * as deleteContactController from 'src/controller/contacts/delete-contact';
import * as getUnreadCountController from 'src/controller/channel/get-unread-count';
import * as markAsReadController from 'src/controller/channel/mark-as-read';
import * as addReactionController from 'src/controller/channel/add-reaction';
import * as removeReactionController from 'src/controller/channel/remove-reaction';

import * as getAttachmentsController from 'src/controller/attachments/get-attachments';
import * as getFileController from 'src/controller/attachments/get-file';
import * as uploadAttachmentsController from 'src/controller/attachments/upload-attachments';

import initializeModels from 'src/model/rethinkdb';
import Rethinkdb from 'src/library/rethinkdb';
import * as api from 'src/services/api';

before(async function () {
  this.sandbox = sinon.createSandbox();

  this.initiateChannelController = (this.sandbox as sinon.SinonSandbox)
    .stub(initiateChannelController, 'default')
    .resolves({ status: 201, body: true });
  this.getChannelsController = (this.sandbox as sinon.SinonSandbox)
    .stub(getChannelsController, 'default')
    .resolves({ status: 200, body: null });
  this.deleteChannelController = (this.sandbox as sinon.SinonSandbox)
    .stub(deleteChannelController, 'default')
    .resolves({ status: 200, body: null });
  this.getUnreadCountController = (this.sandbox as sinon.SinonSandbox)
    .stub(getUnreadCountController, 'default')
    .resolves({ status: 200, body: null });
  this.markAsReadController = (this.sandbox as sinon.SinonSandbox)
    .stub(markAsReadController, 'default')
    .resolves({ status: 200, body: null });

  this.addReactionController = (this.sandbox as sinon.SinonSandbox)
    .stub(addReactionController, 'default')
    .resolves({ status: 200, body: null });
  this.removeReactionController = (this.sandbox as sinon.SinonSandbox)
    .stub(removeReactionController, 'default')
    .resolves({ status: 200, body: null });

  this.createPersonControllerStub = (this.sandbox as sinon.SinonSandbox)
    .stub(createPersonController, 'default')
    .resolves({ status: 201, body: true });
  this.deletePersonControllerStub = (this.sandbox as sinon.SinonSandbox)
    .stub(deletePersonController, 'default')
    .resolves({ status: 200, body: true });
  this.updatePersonController = (this.sandbox as sinon.SinonSandbox)
    .stub(updatePersonController, 'default')
    .resolves({ status: 200, body: true });

  this.postMessageController = (this.sandbox as sinon.SinonSandbox)
    .stub(postMessageController, 'default')
    .resolves({ status: 201, body: true });
  this.getChannelMessagesController = (this.sandbox as sinon.SinonSandbox)
    .stub(getChannelMessagesController, 'default')
    .resolves({ status: 200, body: null });
  this.deleteChannelMessageController = (this.sandbox as sinon.SinonSandbox)
    .stub(deleteChannelMessageController, 'default')
    .resolves({ status: 200, body: null });

  this.authenticateController = (this.sandbox as sinon.SinonSandbox)
    .stub(authenticateController, 'default')
    .resolves({ status: 201, body: null });

  this.postDirectMessageController = (this.sandbox as sinon.SinonSandbox)
    .stub(postDirectMessageController, 'default')
    .resolves({ status: 201, body: true });
  this.getDirectMessagesController = (this.sandbox as sinon.SinonSandbox)
    .stub(getDirectMessagesController, 'default')
    .resolves({ status: 200, body: null });
  this.deleteDirectMessageController = (this.sandbox as sinon.SinonSandbox)
    .stub(deleteDirectMessageController, 'default')
    .resolves({ status: 200, body: null });

  this.addContactController = (this.sandbox as sinon.SinonSandbox)
    .stub(addContactController, 'default')
    .resolves({ status: 201, body: true });
  this.getContactsController = (this.sandbox as sinon.SinonSandbox)
    .stub(getContactsController, 'default')
    .resolves({ status: 200, body: null });
  this.deleteContactController = (this.sandbox as sinon.SinonSandbox)
    .stub(deleteContactController, 'default')
    .resolves({ status: 200, body: null });

  this.uploadAttachmentsController = (this.sandbox as sinon.SinonSandbox)
    .stub(uploadAttachmentsController, 'default')
    .resolves({ status: 201, body: null });
  this.getAttachmentsController = (this.sandbox as sinon.SinonSandbox)
    .stub(getAttachmentsController, 'default')
    .resolves({ status: 200, body: null });
  this.getFileController = (this.sandbox as sinon.SinonSandbox).stub(
    getFileController,
    'default',
  );

  await Rethinkdb.start();
  await initializeModels();

  await api.start();
});

after(async function () {
  this.sandbox.restore();
  await api.stop();
});
