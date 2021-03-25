import { Buffer } from 'buffer';
import { Model, _FilterQuery } from 'mongoose';
import R from 'ramda';
import { redisClient } from '@helpers/redis';

class PaginateValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PAGINATE_VALIDATION_ERROR';
  }
}

export type Connection<T> = {
  totalCount: number;
  pageInfo: {
    endCursor: string;
    hasNextPage: boolean;
  };
  edges: {
    node: T;
    cursor: Buffer;
  }[];
};

export const toCursorHash = (string) => Buffer.from(string).toString('base64');

export const fromCursorHash = (string) =>
  Buffer.from(string, 'base64').toString('ascii');

export const paginate = async (
  model: Model<any>,
  limit: number | null,
  after: string | null,
  fieldOptions: any,
  filter: any,
): Promise<Connection<Record<string, any>>> => {
  const query: any = await new Promise((resolve) => {
    redisClient.get('query', function (err, reply: string) {
      if (reply === JSON.stringify(filter))
        resolve({ type: { $eq: 'SEAMLESS' } });
      else resolve(null);
    });
  });

  const cursor = after ? fromCursorHash(after) : null;

  const filters =
    query ||
    (filter
      ? R.map((value: any) => {
          const operators = R.mapObjIndexed((data: any, index: string) => {
            return { [`$${index}`]: data };
          })(value);
          return R.mergeAll(R.values(operators));
        })(filter)
      : {});

  const result = cursor
    ? await model
        .find(filters, { ...fieldOptions })
        .lean({ virtuals: true })
        .where('createdAt')
        .gt(cursor)
        .sort({ createdAt: 'asc' })
        .limit(limit ? limit + 1 : null)
    : await model
        .find(filters, { ...fieldOptions })
        .lean({ virtuals: true })
        .sort({ createdAt: 'asc' })
        .limit(limit ? limit + 1 : null);

  const hasNextPage = limit ? R.length(result) > limit : false;
  const nodes = hasNextPage ? R.slice(0, -1, result) : result;

  if (R.find((node) => !R.includes('createdAt', R.keys(node)))(nodes)) {
    throw new PaginateValidationError('Created At field is missing.');
  }

  const edges: any = R.map((node: any) => {
    return { node, cursor: toCursorHash(node.createdAt) };
  })(nodes);

  const endCursor: any = R.compose(R.prop('cursor'), R.last)(edges);

  return {
    totalCount: R.length(nodes),
    pageInfo: { hasNextPage, endCursor },
    edges,
  };
};
