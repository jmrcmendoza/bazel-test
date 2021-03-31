import PersonModel from 'src/model/rethinkdb/person';
import ChannelModel from 'src/model/rethinkdb/channel';
import MessageModel from 'src/model/rethinkdb/message';
import IntegrationModel from 'src/model/rethinkdb/integration';
import ContactModel from 'src/model/rethinkdb/contact';
import ChannelStatModel from 'src/model/rethinkdb/channel-stat';
import AttachmentModel from 'src/model/rethinkdb/attachment';

import {
  ChannelDbAdapter,
  IntegrationDbAdapter,
  MessageDbAdapter,
  PersonDbAdapter,
  ContactDbAdapter,
  ChannelStatDbAdapter,
  AttachmentDbAdapter,
} from 'src/types/db-adapter';

export default {
  Person: PersonModel,
  Channel: ChannelModel,
  Message: MessageModel,
  Integration: IntegrationModel,
  Contact: ContactModel,
  ChannelStat: ChannelStatModel,
  Attachment: AttachmentModel,
} as {
  Person: PersonDbAdapter;
  Channel: ChannelDbAdapter;
  Message: MessageDbAdapter;
  Integration: IntegrationDbAdapter;
  Contact: ContactDbAdapter;
  ChannelStat: ChannelStatDbAdapter;
  Attachment: AttachmentDbAdapter;
};
