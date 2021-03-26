import { Dictionary } from 'ramda';

export type ID = string;

export enum SortDirection {
  ASC,
  DESC,
}

export interface ClientTokenPayload {
  person: ID;
  integrationKey: ID;
}

export type SocketPayload<T = Dictionary<any>> = T & { id: ID };

export interface Integration {
  id: ID;
  key: string;
  contacts: boolean;
}

export interface Person {
  id: ID;
  meta: Dictionary<any>;
  integration: ID;
  archived: boolean;
  connectionStatus: string;
  status: string | null;
  dateTimeCreated: Date;
  dateTimeUpdated?: Date;

  cursorDateTimeCreated: string;
}

export interface Contact {
  id: ID;
  integration: ID;
  person: ID;
  contacts: ID[];
  archived: boolean;
  dateTimeCreated: Date;
  dateTimeUpdated?: Date;

  cursorDateTimeCreated: string;
}

export interface Channel {
  id: ID;
  meta: Dictionary<any>;
  integration: ID;
  persons: ID[];
  archived: boolean;
  dateTimeCreated: Date;
  dateTimeUpdated?: Date;

  cursorDateTimeCreated: string;
}

export interface ChannelStat {
  id: ID;
  channel: ID;
  person: ID;
  count: number;
  dateTimeCreated: Date;
  dateTimeUpdated?: Date;

  cursorDateTimeCreated: string;
}

export interface Message {
  id: ID;
  integration: ID;
  body: string;
  channel: string;
  sender: ID;
  reactions: Record<string, string[]>;
  attachments: ID[];
  archived: boolean;
  dateTimeCreated: Date;
  dateTimeUpdated?: Date;

  cursorDateTimeCreated: string;
}

export interface Attachment {
  id: ID;
  integration: ID;
  channel: string;
  person: ID;
  filename: string;
  path: string;
  dateTimeCreated: Date;
  dateTimeUpdated?: Date;

  cursorDateTimeCreated: string;
}
