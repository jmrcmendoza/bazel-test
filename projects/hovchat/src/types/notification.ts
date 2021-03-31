import { Channel, Message, Person } from './common';

export interface NotificationEvents {
  messageCreated: (message: Message) => void;
  messageUpdated: (message: Message) => void;
  messageDeleted: (message: Message) => void;

  channelCreated: (channel: Channel) => void;
  channelUpdated: (channel: Channel) => void;
  channelDeleted: (channel: Channel) => void;

  personUpdated: (person: { previous: Person; current: Person }) => void;
}
