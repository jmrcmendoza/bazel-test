/* eslint-disable no-underscore-dangle */
import rethinkdb, { Connection } from 'rethinkdb';
import R from 'ramda';

class RethinkDB {
  private _connection: Connection | undefined;

  public readonly db: rethinkdb.Db = rethinkdb.db(
    process.env.RETHINKDB_DB || 'test',
  );

  async start(opt?: { host?: string; port?: number }) {
    if (this._connection) return;
    this._connection = await rethinkdb.connect(
      R.mergeDeepLeft(opt || {}, { host: 'localhost', port: 28015 }) as {
        host: string;
        port: number;
      },
    );
  }

  async stop() {
    if (this._connection) {
      await this._connection.close();
    }
  }

  public get connection() {
    return this._connection as Connection;
  }

  public dbList() {
    return rethinkdb.dbList();
  }

  public tableList() {
    return this.db.tableList().run(this._connection as rethinkdb.Connection);
  }

  public tableCreate(table: string) {
    return this.db
      .tableCreate(table)
      .run(this._connection as rethinkdb.Connection);
  }
}

export default new RethinkDB();
