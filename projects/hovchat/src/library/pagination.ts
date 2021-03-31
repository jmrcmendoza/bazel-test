import R from 'ramda';

export type Connection<T> = {
  totalCount: number;
  pageInfo: {
    endCursor: string;
    hasNextPage: boolean;
  };
  edges: {
    node: T;
    cursor: string;
  }[];
};
export default (
  limit: number | null,
  data: any,
  cursor = 'cursorDateTimeCreated',
): Connection<Record<string, any>> => {
  const hasNextPage = limit ? R.length(data) > limit : false;
  const nodes = hasNextPage ? R.slice(0, -1, data) : data;

  const edges: any = R.map((node: any) => ({
    node,
    cursor: node[cursor],
  }))(nodes);

  const endCursor: any = R.compose(R.prop('cursor') as any, R.last)(edges);

  return {
    totalCount: R.length(nodes),
    pageInfo: { hasNextPage, endCursor },
    edges,
  };
};
