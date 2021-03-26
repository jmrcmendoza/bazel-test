import { ContactDbAdapter } from 'src/types/db-adapter';
import { Contact } from 'src/types/common';
import rethinkdb from 'src/library/rethinkdb';
import r from 'rethinkdb';
import R from 'ramda';
import Model from './model';

class ContactModel
  extends Model<Contact, 'cursorDateTimeCreated' | 'person'>
  implements ContactDbAdapter {
  sanitizeCreateParam(obj: Partial<Contact>) {
    const now = new Date();
    return {
      ...obj,
      archived: false,
      dateTimeCreated: now,
      dateTimeUpdated: now,
      cursorDateTimeCreated: now.getTime().toString(36),
    } as Contact;
  }

  sanitizeUpdateParam(obj: Partial<Contact>) {
    const now = new Date();
    return {
      ...obj,
      dateTimeUpdated: now,
    } as Contact;
  }

  async addContact(person: string, integration: string, contact: string) {
    await this.table
      .getAll([person, integration], { index: 'person' })
      .update({
        contacts: (r.row('contacs').default([]) as any).setInsert(contact),
      })
      .run(rethinkdb.connection);
    return true;
  }

  async deleteContact(person: string, integration: string, contact: string) {
    await this.table
      .getAll([person, integration], { index: 'person' })
      .update({
        contacts: (r.row('contacs').default([]) as any).difference([contact]),
      })
      .run(rethinkdb.connection);
    return true;
  }

  async getContacts(person: string, integration: string) {
    const cursor = await this.table
      .getAll([person, integration], { index: 'person' })
      .filter({ person })
      .limit(1)
      .run(rethinkdb.connection);

    return R.head(await cursor.toArray()) || null;
  }
}

export default new ContactModel('contacts', {
  person: (table: r.Table, index: string) => {
    return table.indexCreate(index, [r.row('person'), r.row('integration')]);
  },
  cursorDateTimeCreated: Model.BasicIndex,
});
