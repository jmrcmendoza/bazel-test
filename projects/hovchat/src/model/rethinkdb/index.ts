import ChannelModel from './channel';
import IntegrationModel from './integration';
import MessageModel from './message';
import PersonModel from './person';
import ContactModel from './contact';
import ChannelStatModel from './channel-stat';
import AttachmentModel from './attachment';

export default () =>
  Promise.all(
    [
      ChannelModel,
      IntegrationModel,
      MessageModel,
      PersonModel,
      ContactModel,
      ChannelStatModel,
      AttachmentModel,
    ].map((model) => model.initialize()),
  );
