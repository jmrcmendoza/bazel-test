import R from 'ramda';

export const getLastDataId = R.compose(R.prop('id'), R.prop('node'), R.last);

export const getLastData = R.compose(R.prop('node'), R.last);

export const getFirstData = R.compose(R.prop('node'), R.head);
