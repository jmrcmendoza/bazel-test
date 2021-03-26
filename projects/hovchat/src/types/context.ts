import SocketIO from 'socket.io';
import Router from 'koa-router';
import { Channel, ID, Integration, Person } from './common';

import {
  ChannelDbAdapter,
  IntegrationDbAdapter,
  MessageDbAdapter,
  PersonDbAdapter,
} from './db-adapter';

export interface RouterContext extends Router.RouterContext {
  state: {
    person?: Person;
    integration?: Integration;
    channel?: Channel;

    personModel: PersonDbAdapter;
    messageModel: MessageDbAdapter;
    channelModel: ChannelDbAdapter;
    integrationModel: IntegrationDbAdapter;
  };
}

export type SocketIOContext = SocketIO.Socket & {
  state: {
    person: ID;
    channel?: ID;
    integration: ID;
  };
};
