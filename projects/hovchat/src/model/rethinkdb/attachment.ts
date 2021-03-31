/* eslint-disable radix */
import { AttachmentDbAdapter } from 'src/types/db-adapter';
import { Attachment } from 'src/types/common';
import rethinkdb from 'src/library/rethinkdb';
import R from 'ramda';
import r from 'rethinkdb';
import Model from './model';

class AttachmentModel
  extends Model<Attachment, 'cursorDateTimeCreated' | 'attachmentChannel'>
  implements AttachmentDbAdapter {
  sanitizeCreateParam(obj: Partial<Attachment>) {
    const now = new Date();
    return {
      ...obj,
      dateTimeCreated: now,
      dateTimeUpdated: now,
      cursorDateTimeCreated: now.getTime().toString(36),
    } as Attachment;
  }

  async insertAttachments(
    files: any,
    person: string,
    channel: string,
    integration: string,
  ) {
    const now = new Date();

    const attachments = R.map((file: any) => ({
      filename: file.filename,
      path: file.path,
      person,
      integration,
      channel,
      dateTimeCreated: now,
      dateTimeUpdated: now,
      cursorDateTimeCreated: now.getTime().toString(36),
    }))(files);

    const result = await this.table
      .insert(attachments)
      .run(rethinkdb.connection);

    return result.generated_keys;
  }

  async getAttachments(
    filter: { channel: string; integration: string },
    first = '1000',
    after: string,
    cursorField = 'cursorDateTimeCreated',
  ) {
    const query = this.table
      .getAll([filter.channel, filter.integration], {
        index: 'attachmentChannel',
      })
      .filter(after ? r.row(cursorField).lt(after) : {})
      .orderBy(r.desc(cursorField));

    const cursor = await query
      .limit(parseInt(first) + 1)
      .run(rethinkdb.connection);

    return cursor.toArray();
  }
}

export default new AttachmentModel('attachments', {
  attachmentChannel: (table: r.Table, index: string) => {
    return table.indexCreate(index, [r.row('channel'), r.row('integration')]);
  },
  cursorDateTimeCreated: Model.BasicIndex,
});
