import assert from 'assert';
import R from 'ramda';
import equal from 'deep-equal';

import Rethinkdb from 'src/library/rethinkdb';
import MessageModel from 'src/model/rethinkdb/message';
import ChannelModel from 'src/model/rethinkdb/channel';
import PersonModel from 'src/model/rethinkdb/person';

import Logger from 'src/library/logger';

import { Channel, Message, Person } from 'src/types/common';
import Notification from '../notification';

const logger = Logger.tag(['notification', 'rethinkdb-adapter']);

type RethinkDBRow<T> = { old_val: T | null; new_val: T | null };

class RethinkdbNotificationAdapter extends Notification {
  private closeMessageCursor = R.always(Promise.resolve());

  private closeChannelCursor = R.always(Promise.resolve());

  private closePersonCursor = R.always(Promise.resolve());

  private closed = false;

  async start() {
    MessageModel.table
      .filter({})
      .changes()
      .run(Rethinkdb.connection, (error, cursor) => {
        if (error) {
          logger.tag('message-model').error(error);
          return;
        }

        this.closeMessageCursor = () => cursor.close();

        cursor.each((err, row: RethinkDBRow<Message>) => {
          if (err) {
            logger.tag(['message-model', 'row']).error(err);
            return;
          }

          if (row.new_val !== null && row.old_val !== null) {
            this.emit('messageUpdated', row.new_val);
            return;
          }

          if (row.new_val && row.old_val === null) {
            this.emit('messageCreated', row.new_val);
            return;
          }

          assert(row.old_val);
          this.emit('messageDeleted', row.old_val);
        });
      });

    ChannelModel.table
      .filter({})
      .changes()
      .run(Rethinkdb.connection, (error, cursor) => {
        if (error) {
          logger.tag('channel-model').error(error);
          return;
        }

        this.closeChannelCursor = () => cursor.close();

        cursor.each((err, row: RethinkDBRow<Channel>) => {
          if (err) {
            logger.tag(['channel-model', 'row']).error(err);
            return;
          }

          if (row.new_val !== null && row.old_val !== null) {
            this.emit('channelUpdated', row.new_val);
            return;
          }

          if (row.new_val && row.old_val === null) {
            this.emit('channelCreated', row.new_val);
            return;
          }

          assert(row.old_val);
          this.emit('channelDeleted', row.old_val);
        });
      });

    PersonModel.table
      .filter({})
      .changes()
      .run(Rethinkdb.connection, (error, cursor) => {
        if (error) {
          logger.tag('person-model').error(error);
          return;
        }

        this.closeMessageCursor = () => cursor.close();

        cursor.each((err, row: RethinkDBRow<Person>) => {
          if (err) {
            logger.tag(['person-model', 'row']).error(err);
            return;
          }

          if (row.new_val !== null && row.old_val !== null) {
            if (
              !equal(row.old_val.meta, row.new_val.meta) ||
              !equal(row.old_val.status, row.new_val.status) ||
              !equal(
                row.old_val.connectionStatus,
                row.new_val.connectionStatus,
              ) ||
              !equal(row.old_val.archived, row.new_val.archived)
            ) {
              this.emit('personUpdated', {
                previous: row.old_val,
                current: row.new_val,
              });
            }
          }
        });
      });
  }

  async stop() {
    if (this.closed) {
      logger.warn('closing the adapter while state is already closed.');
      return;
    }

    this.closed = true;
    this.closeMessageCursor();
    this.closeChannelCursor();
    this.closePersonCursor();
  }
}

export default new RethinkdbNotificationAdapter();
