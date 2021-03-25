import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import { makeMember } from '@entities/members';

const chance = new Chance();

chai.use(chaiAsPromised);

describe('Entities - Members', () => {
  it('should throw an error for null vendor name', async () => {
    const data = {
      username: '',
      password: chance.string({ length: 5 }),
    };

    await expect(makeMember(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'MEMBER_VALIDATION_ERROR',
    );
    await expect(makeMember(data)).to.eventually.rejectedWith(
      'Username must be provided.',
    );
  });

  it('should throw an error for null vendor type', async () => {
    const data = {
      username: chance.name(),
      password: '',
    };

    await expect(makeMember(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'MEMBER_VALIDATION_ERROR',
    );
    await expect(makeMember(data)).to.eventually.rejectedWith(
      'Password must be provided.',
    );
  });

  it('should return undefined', async () => {
    const data = {
      username: chance.name(),
      password: chance.string({ length: 5 }),
    };

    await expect(makeMember(data)).to.eventually.be.fulfilled;
  });
});
