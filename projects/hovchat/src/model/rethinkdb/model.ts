/* eslint-disable max-classes-per-file */
import r, { Expression, ExpressionFunction } from 'rethinkdb';
import R from 'ramda';

import rethinkdb from 'src/library/rethinkdb';

type RethinkDBFilter<T> =
  | Partial<T>
  | ExpressionFunction<boolean>
  | Expression<boolean>;

type RethinkDBSort<T extends Record<string, unknown>, I = keyof T> =
  | Parameters<r.Table['orderBy']>[0]
  | { index: I };
export default class Model<
  Document extends Record<string, any>,
  Indices extends string = ''
> {
  public readonly table: r.Table;

  public constructor(
    public readonly tableName: string,
    protected readonly indices?: {
      [key in Indices]: (
        table: r.Table,
        index: string,
      ) => r.Operation<r.CreateResult>;
    },
  ) {
    this.table = rethinkdb.db.table(tableName);
  }

  public static BasicIndex(table: r.Table, index: string) {
    return table.indexCreate(index);
  }

  public async initialize() {
    const tableList = await rethinkdb.db.tableList().run(rethinkdb.connection);
    if (!tableList.includes(this.tableName)) {
      await rethinkdb.db.tableCreate(this.tableName).run(rethinkdb.connection);
    }

    if (this.indices) {
      const indices = await this.table.indexList().run(rethinkdb.connection);
      const uninitializedIndices = Object.keys(this.indices).filter(
        (idx) => !indices.includes(idx),
      );
      await Promise.all(
        uninitializedIndices.map(async (idx: any) => {
          await (this.indices as any)
            [idx](this.table, idx)
            .run(rethinkdb.connection);
          await this.table.indexWait(idx).run(rethinkdb.connection);
        }),
      );
    }
  }

  public async findOne(
    filter: RethinkDBFilter<Document>,
  ): Promise<Document | null> {
    const cursor = await this.table
      .filter(filter)
      .limit(1)
      .run(rethinkdb.connection);

    return R.head(await cursor.toArray()) || null;
  }

  public async findOneAndUpdate(
    filter: RethinkDBFilter<Document>,
    obj: Partial<Document>,
  ) {
    await this.table
      .filter(filter)
      .limit(1)
      .update(obj)
      .run(rethinkdb.connection);
    return true;
  }

  public async findOneAndDelete(filter: RethinkDBFilter<Document>) {
    await this.table.filter(filter).limit(1).delete().run(rethinkdb.connection);

    return true;
  }

  public async findById(id: string): Promise<Document | null> {
    return this.table.get<Document>(id).run(rethinkdb.connection);
  }

  public async findByIdAndUpdate(id: string, obj: Partial<Document>) {
    await this.table.get(id).update(obj).run(rethinkdb.connection);
    return true;
  }

  public async findByIdAndDelete(id: string) {
    await this.table.get(id).delete().run(rethinkdb.connection);
    return true;
  }

  protected sanitizeCreateParam(obj: Partial<Document>): Document {
    return obj as Document;
  }

  public async create(obj: Partial<Document>) {
    await this.table
      .insert(this.sanitizeCreateParam(obj))
      .run(rethinkdb.connection);
    return obj as Document;
  }

  public async find(
    filter: RethinkDBFilter<Document>,
    orderBy?: RethinkDBSort<Document, Indices>,
    start = 0,
    end = 1000,
  ): Promise<Document[]> {
    let query = this.table.filter(filter);

    if (orderBy) {
      query = query.orderBy(r.row('oeu'));
    }

    const cursor = await query.slice(start, end).run(rethinkdb.connection);

    return cursor.toArray();
  }

  protected sanitizeUpdateParam(obj: Partial<Document>) {
    return obj;
  }

  public async updateMany(
    filter: RethinkDBFilter<Document>,
    obj: Partial<Document>,
  ) {
    return this.findAndUpdate(filter, obj);
  }

  public async findAndUpdate(
    filter: RethinkDBFilter<Document>,
    obj: Partial<Document>,
  ) {
    await this.table
      .filter(filter)
      .update(this.sanitizeUpdateParam(obj))
      .run(rethinkdb.connection);
    return true;
  }

  public async deleteMany(filter: RethinkDBFilter<Document>) {
    return this.findAndDelete(filter);
  }

  public async findAndDelete(filter: RethinkDBFilter<Document>) {
    await this.table.filter(filter).delete().run(rethinkdb.connection);
    return true;
  }

  public async changes(
    filter: RethinkDBFilter<Document>,
    changesOption: r.ChangesOptions,
  ) {
    return this.table
      .filter(filter)
      .changes(changesOption)
      .run(rethinkdb.connection);
  }

  public async count(): Promise<number> {
    return this.table.count().run(rethinkdb.connection);
  }
}
