import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import { makePromo } from '@entities/promos';
import { MemberFields, PromoTemplate } from '@models/promo';

const chance = new Chance();

chai.use(chaiAsPromised);

describe('Promo Entity', () => {
  it('should throw an error for empty name', async () => {
    const data = {
      name: '',
      template: PromoTemplate.Deposit,
      title: chance.word(),
      description: chance.sentence(),
      minimumBalance: chance.prime(),
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_VALIDATION_ERROR',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Promo name must be provided.',
    );
  });

  it('should throw an error for empty template', async () => {
    const data = {
      name: chance.name(),
      template: '',
      title: chance.word(),
      description: chance.sentence(),
      minimumBalance: chance.prime(),
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_VALIDATION_ERROR',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Template must be provided.',
    );
  });

  it('should throw an error for invalid template', async () => {
    const data = {
      name: chance.name(),
      template: 'Test',
      title: chance.word(),
      description: chance.sentence(),
      minimumBalance: chance.prime(),
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'INVALID_PROMO_TYPE',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Invalid template.',
    );
  });

  it('should throw an error for empty title', async () => {
    const data = {
      name: chance.name(),
      template: PromoTemplate.Deposit,
      title: '',
      description: chance.sentence(),
      minimumBalance: chance.prime(),
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_VALIDATION_ERROR',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Promo title must be provided',
    );
  });

  it('should throw an error for empty description', async () => {
    const data = {
      name: chance.name(),
      template: PromoTemplate.Deposit,
      title: chance.word(),
      description: '',
      minimumBalance: chance.prime(),
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_VALIDATION_ERROR',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Description must be provided.',
    );
  });

  it('should throw an error for empty minimum balance given the template is deposit', async () => {
    const data = {
      name: chance.name(),
      template: PromoTemplate.Deposit,
      title: chance.word(),
      description: chance.sentence(),
      minimumBalance: null,
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_VALIDATION_ERROR',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Minimum balance must be provided.',
    );
  });

  it('should throw an error for empty member fields given the template is sign up', async () => {
    const data = {
      name: chance.name(),
      template: PromoTemplate.SignUp,
      title: chance.word(),
      description: chance.sentence(),
      requiredMemberFields: [],
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'PROMO_VALIDATION_ERROR',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Members fields must be provided.',
    );
  });

  it('should throw an error for invalid member fields given the template is sign up', async () => {
    const data = {
      name: chance.name(),
      template: PromoTemplate.SignUp,
      title: chance.word(),
      description: chance.sentence(),
      requiredMemberFields: ['Test'],
    };

    await expect(makePromo(data)).to.eventually.rejected.and.to.have.property(
      'name',
      'INVALID_MEMBER_FIELD',
    );
    await expect(makePromo(data)).to.eventually.rejectedWith(
      'Test is an invalid field.',
    );
  });

  it('should return undefined', async () => {
    const data = {
      name: chance.name(),
      template: PromoTemplate.SignUp,
      title: chance.word(),
      description: chance.sentence(),
      requiredMemberFields: [MemberFields.REAL_NAME],
    };

    await expect(makePromo(data)).to.eventually.be.fulfilled.and.be.undefined;
  });
});
