import { Dictionary } from 'ramda';
import {
  Channel,
  ChannelStat,
  Contact,
  ID,
  Integration,
  Message,
  Person,
  SortDirection,
  Attachment,
} from './common';

interface BaseCriteria<SortOpt> {
  first?: number;
  after?: string;
  sort?: SortOpt;
}

interface DbAdapterSelect<Criteria, Result, SortOpt = any> {
  find(criteria: Criteria & BaseCriteria<SortOpt>): Promise<Result[]>;
  findOne(criteria: Criteria): Promise<Result | null>;
  findById(id: ID): Promise<Result | null>;
}

interface DbAdapterUpdate<Criteria, Changes, SortOpt = any> {
  findOneAndUpdate(
    criteria: Criteria & BaseCriteria<SortOpt>,
    changes: Changes,
  ): Promise<boolean>;
  findByIdAndUpdate(id: ID, changes: Changes): Promise<boolean>;
  updateMany(criteria: Criteria, changes: Changes): Promise<boolean>;
}

interface DbAdapterDelete<Criteria, SortOpt = any> {
  findOneAndDelete(criteria: Criteria): Promise<boolean>;
  findByIdAndDelete(id: ID): Promise<boolean>;
  deleteMany(criteria: Criteria & BaseCriteria<SortOpt>): Promise<boolean>;
}

interface DbAdapterCreate<Props> {
  create(obj: Props): Promise<Props>;
}

interface DbAdapter<CreateParam, Props, Criteria, SortOpt = any>
  extends DbAdapterCreate<CreateParam>,
    DbAdapterSelect<Criteria, Props, SortOpt>,
    DbAdapterUpdate<Criteria, Partial<Props>, SortOpt>,
    DbAdapterDelete<Criteria, SortOpt> {}

export interface PersonSortOption {
  cursorDateTimeCreated?: SortDirection;
}

export interface PersonCreateParam {
  id: ID;
  integration: ID;
  meta?: Dictionary<any>;
}

export type PersonDbAdapter<Criteria = Partial<Person>> = DbAdapter<
  PersonCreateParam,
  Person,
  Criteria,
  PersonSortOption
>;

export interface MessageSortOption {
  cursorDateTimeCreated?: SortDirection;
}

export interface MessageCreateParam {
  integration: ID;
  channel: ID;
  body: string;
  sender: ID;
  attachments?: ID[];
}

export type MessageDbAdapter<Criteria = Partial<Message>> = DbAdapter<
  MessageCreateParam,
  Message,
  Criteria,
  MessageSortOption
>;

export interface ChannelSortOption {
  cursorDateTimeCreated?: SortDirection;
}

export interface ChannelCreateParam {
  id: ID;
  integration: ID;
  meta?: Dictionary<any>;
  persons: ID[];
}

export type ChannelDbAdapter<Criteria = Partial<Channel>> = DbAdapter<
  ChannelCreateParam,
  Channel,
  Criteria,
  ChannelSortOption
>;

export interface IntegrationCreateParam {
  key: string;
  contacts?: boolean;
}

export type IntegrationDbAdapter<Criteria = Partial<Integration>> = DbAdapter<
  IntegrationCreateParam,
  Integration,
  Criteria
>;

export interface ContactCreateParam {
  person: string;
  contacts: string[];
  integration: string;
}

export type ContactDbAdapter<Criteria = Partial<Contact>> = DbAdapter<
  ContactCreateParam,
  Contact,
  Criteria
>;

export interface ChannelStatCreateParam {
  person: string;
  channel: string;
}

export type ChannelStatDbAdapter<Criteria = Partial<ChannelStat>> = DbAdapter<
  ChannelStatCreateParam,
  ChannelStat,
  Criteria
>;

export interface AttachmentCreateParam {
  integration: string;
  channel: string;
  person: string;
  path: string;
  filename: string;
}

export type AttachmentDbAdapter<Criteria = Partial<Attachment>> = DbAdapter<
  AttachmentCreateParam,
  Attachment,
  Criteria
>;
