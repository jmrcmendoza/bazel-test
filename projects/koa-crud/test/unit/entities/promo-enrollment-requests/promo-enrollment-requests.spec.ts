import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { makePromoEnrollmentRequest } from '@entities/promo-enrollment-requests';
import chance from '../../../helpers/chance';

chai.use(chaiAsPromised);

describe('Promo Enrollment Request Entity', () => {
  it('should throw an error for empty promo', async function () {
    this.data = {
      promo: '',
      member: chance.string(),
    };

    await expect(
      makePromoEnrollmentRequest(this.data),
    ).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR',
    );
    await expect(
      makePromoEnrollmentRequest(this.data),
    ).to.eventually.rejectedWith('Promo must be provided.');
  });

  it('should throw an error for empty member', async function () {
    this.data = {
      promo: chance.string(),
      member: '',
    };

    await expect(
      makePromoEnrollmentRequest(this.data),
    ).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR',
    );
    await expect(
      makePromoEnrollmentRequest(this.data),
    ).to.eventually.rejectedWith('Member must be provided.');
  });

  it('should return undefined', async function () {
    this.data = {
      promo: chance.string(),
      member: chance.string(),
    };

    await expect(makePromoEnrollmentRequest(this.data)).to.eventually.be
      .fulfilled.and.be.undefined;
  });
});
