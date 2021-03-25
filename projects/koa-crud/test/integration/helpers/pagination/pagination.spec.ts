/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import R from 'ramda';
import { fromCursorHash, paginate, toCursorHash } from '@helpers/pagination';
import MemberModel from '@models/member';

const chance = new Chance();

chai.use(chaiAsPromised);

describe('Pagination', () => {
  before(async () => {
    await MemberModel.deleteMany({});
    R.times(
      () =>
        MemberModel.create({
          username: chance.first(),
          password: chance.word(),
        }),
      3,
    );
  });
  it('should return false on next page given limit value is equal to data length ', async () => {
    const result = await paginate(MemberModel, 3, null, null);

    expect(result).to.have.property('totalCount', 3);
    expect(result).to.have.property('pageInfo');
    expect(result).to.have.property('edges');
    expect(result.pageInfo.hasNextPage).to.be.false;
  });

  it('should return true on next page given limit value is less than data length ', async () => {
    const result = await paginate(MemberModel, 2, null, null);

    expect(result).to.have.property('totalCount', 2);
    expect(result).to.have.property('pageInfo');
    expect(result).to.have.property('edges');
    expect(result.pageInfo.hasNextPage).to.be.true;
  });

  it('should thrown error for missing createdAt field', async () => {
    await expect(paginate(MemberModel, 3, null, { password: 0, createdAt: 0 }))
      .to.eventually.rejectedWith('Created At field is missing.')
      .and.to.have.property('name', 'PAGINATE_VALIDATION_ERROR');
  });
});

describe('toCursorHash', () => {
  it('should return Buffer string', () => {
    const result = toCursorHash(chance.date());

    expect(typeof result).to.equal('string');
  });

  it('should throw an error for invalid data', () => {
    expect(() => toCursorHash(chance.natural()))
      .to.be.throw()
      .and.have.property('name', 'TypeError');
  });
});

describe('fromCursorHash', () => {
  it('should return date equal to the data', () => {
    const data = chance.date();

    const cursorHash = toCursorHash(data);

    const result = fromCursorHash(cursorHash);

    expect(typeof result).to.equal('string');
    expect(new Date(result).toDateString()).to.equal(data.toDateString());
  });

  it('should throw an error for invalid data', () => {
    expect(() => fromCursorHash(chance.natural()))
      .to.be.throw()
      .and.have.property('name', 'TypeError');
  });
});
