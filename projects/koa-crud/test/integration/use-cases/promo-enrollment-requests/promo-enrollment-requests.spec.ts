/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import R from 'ramda';
import Chance from 'chance';
import server from '@server';
import {
  approvePromoEnrollmentRequest,
  enrollToPromo,
  listPromoEnrollmentRequests,
  processPromoEnrollmentRequest,
  rejectPromoEnrollmentRequest,
  selectOnePromoEnrollmentRequest,
} from '@useCases/promo-enrollment-requests';
import PromoEnrollmentRequestModel, {
  PromoEnrollmentRequestStatus,
} from '@models/promo-enrollment-requests';
import MemberModel from '@models/member';
import PromoModel, { PromoStatus, PromoTemplate } from '@models/promo';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Promo Enrollment Request Use Cases', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  after(async function () {
    await Promise.all([
      MemberModel.deleteMany({}),
      PromoModel.deleteMany({}),
      PromoEnrollmentRequestModel.deleteMany({}),
    ]);
  });

  describe('Enroll to Promo', () => {
    beforeEach(async function () {
      await Promise.all([
        MemberModel.create({
          username: chance.first(),
          password: chance.string(),
        }),
        PromoModel.create({
          name: chance.first(),
          template: PromoTemplate.Deposit,
          title: chance.first(),
          description: chance.sentence(),
          submitted: true,
          enabled: true,
          status: PromoStatus.Active,
          minimumBalance: chance.natural(),
        }),
      ]);
    });

    context('Given incorrect values', () => {
      it('should throw an error for empty promo', async () => {
        const member = await MemberModel.findOne({}).lean({ virtuals: true });

        const data = {
          promo: '',
          member: member.id,
        };

        await expect(
          enrollToPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR',
        );
        await expect(enrollToPromo(data)).to.eventually.rejectedWith(
          'Promo must be provided.',
        );
      });

      it('should throw an error for empty member', async () => {
        const promo = await PromoModel.findOne({}).lean({ virtuals: true });

        const data = {
          promo: promo.id,
          member: '',
        };

        await expect(
          enrollToPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR',
        );
        await expect(enrollToPromo(data)).to.eventually.rejectedWith(
          'Member must be provided.',
        );
      });
    });

    context('Given correct values', () => {
      it('should throw an error for enrolling to draft promo', async () => {
        const member = await MemberModel.findOne({}).lean({ virtuals: true });
        const promo = await PromoModel.create({
          name: chance.first(),
          template: PromoTemplate.Deposit,
          title: chance.first(),
          description: chance.sentence(),
          submitted: true,
          enabled: true,
          status: PromoStatus.Draft,
          minimumBalance: chance.natural(),
        });

        const data = {
          promo: promo.id,
          member: member.id,
        };

        await expect(
          enrollToPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'INVALID_PROMO_STATUS_ERROR',
        );
        await expect(enrollToPromo(data)).to.eventually.rejectedWith(
          'Cannot enroll to Inactive/Draft promo.',
        );
      });

      it('should throw an error member missing field', async () => {
        const member = await MemberModel.create({
          username: chance.last(),
          password: chance.string({ length: 5 }),
        });
        const promo = await PromoModel.create({
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: ['EMAIL'],
          status: PromoStatus.Active,
        });

        const data = {
          promo: promo._id,
          member: member._id,
        };

        await expect(
          enrollToPromo(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'MEMBER_FIELD_MISSING',
        );
        await expect(enrollToPromo(data)).to.eventually.rejectedWith(
          'EMAIL member field is missing.',
        );
      });

      it('should enroll to a promo', async () => {
        const member = await MemberModel.create({
          username: chance.last(),
          password: chance.string({ length: 5 }),
        });
        const promo = await PromoModel.create({
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        });

        const data = {
          promo: promo._id,
          member: member._id,
        };

        const result = await enrollToPromo(data);

        expect(result).to.be.true;
      });
    });
  });

  describe('List Promo Enrollment Requests', () => {
    it('should return all promo enrollment requests', async () => {
      const result = await listPromoEnrollmentRequests();

      expect(result).to.exist;
      expect(result.edges).to.be.an('array');
      expect(result.totalCount).to.be.greaterThan(0);
    });

    it('should return one promo enrollment request', async () => {
      const promoEnrollmentRequests = await listPromoEnrollmentRequests();

      const lastpromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.edges);

      const result = await selectOnePromoEnrollmentRequest(
        lastpromoEnrollmentRequestId,
      );

      expect(result).to.exist;
      expect(result).to.be.an('object');
      expect(result.id).to.equal(lastpromoEnrollmentRequestId);
    });
  });

  describe('Process Enrollment Request', () => {
    before(async function () {
      const [member, promo] = await Promise.all([
        MemberModel.create({
          username: chance.first(),
          password: chance.string(),
        }),
        PromoModel.create({
          name: chance.first(),
          template: PromoTemplate.Deposit,
          title: chance.first(),
          description: chance.sentence(),
          submitted: true,
          enabled: true,
          status: PromoStatus.Active,
          minimumBalance: chance.natural(),
        }),
      ]);

      this.promoEnrollmentRequest = await PromoEnrollmentRequestModel.create({
        promo: promo.id,
        member: member.id,
        status: PromoEnrollmentRequestStatus.Pending,
      });
    });

    it('should throw and error for empty id', async function () {
      await expect(
        processPromoEnrollmentRequest(''),
      ).to.eventually.rejected.and.to.have.property(
        'name',
        'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR',
      );
      await expect(
        processPromoEnrollmentRequest(''),
      ).to.eventually.rejectedWith('ID must be provided.');
    });

    it('should process request and return true', async function () {
      const result = await processPromoEnrollmentRequest(
        this.promoEnrollmentRequest.id,
      );

      expect(result).to.be.true;
    });
  });

  describe('Approve Enrollment Request', () => {
    before(async function () {
      const [member, promo] = await Promise.all([
        MemberModel.create({
          username: chance.first(),
          password: chance.string(),
        }),
        PromoModel.create({
          name: chance.first(),
          template: PromoTemplate.Deposit,
          title: chance.first(),
          description: chance.sentence(),
          submitted: true,
          enabled: true,
          status: PromoStatus.Active,
          minimumBalance: chance.natural(),
        }),
      ]);

      this.promoEnrollmentRequest = await PromoEnrollmentRequestModel.create({
        promo: promo.id,
        member: member.id,
        status: PromoEnrollmentRequestStatus.Pending,
      });
    });

    it('should throw and error for empty id', async function () {
      await expect(
        processPromoEnrollmentRequest(''),
      ).to.eventually.rejected.and.to.have.property(
        'name',
        'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR',
      );
      await expect(
        approvePromoEnrollmentRequest(''),
      ).to.eventually.rejectedWith('ID must be provided.');
    });

    it('should approve request and return true', async function () {
      const result = await approvePromoEnrollmentRequest(
        this.promoEnrollmentRequest.id,
      );

      expect(result).to.be.true;
    });
  });

  describe('Reject Enrollment Request', () => {
    before(async function () {
      const [member, promo] = await Promise.all([
        MemberModel.create({
          username: chance.first(),
          password: chance.string(),
        }),
        PromoModel.create({
          name: chance.first(),
          template: PromoTemplate.Deposit,
          title: chance.first(),
          description: chance.sentence(),
          submitted: true,
          enabled: true,
          status: PromoStatus.Active,
          minimumBalance: chance.natural(),
        }),
      ]);

      this.promoEnrollmentRequest = await PromoEnrollmentRequestModel.create({
        promo: promo.id,
        member: member.id,
        status: PromoEnrollmentRequestStatus.Pending,
      });
    });

    it('should throw and error for empty id', async function () {
      await expect(
        processPromoEnrollmentRequest(''),
      ).to.eventually.rejected.and.to.have.property(
        'name',
        'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR',
      );
      await expect(rejectPromoEnrollmentRequest('')).to.eventually.rejectedWith(
        'ID must be provided.',
      );
    });

    it('should reject request and return true', async function () {
      const result = await rejectPromoEnrollmentRequest(
        this.promoEnrollmentRequest.id,
      );

      expect(result).to.be.true;
    });
  });
});
