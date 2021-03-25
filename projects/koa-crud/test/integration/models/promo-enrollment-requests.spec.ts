/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import MemberModel from '@models/member';
import PromoModel, { PromoStatus, PromoTemplate } from '@models/promo';
import PromoEnrollmentRequestModel, {
  PromoEnrollmentRequestStatus,
} from '@models/promo-enrollment-requests';
import chance from '../../helpers/chance';
import DBManager from '../tear-down';

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Promo Enrollment Request Model', () => {
  before(async function () {
    this.dbManager = new DBManager();

    await this.dbManager.start();
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

    afterEach(async function () {
      await Promise.all([
        MemberModel.deleteMany({}),
        PromoModel.deleteMany({}),
        PromoEnrollmentRequestModel.deleteMany({}),
      ]);
    });

    context('Given incorrect values', () => {
      it('should throw an error for empty promo', async () => {
        const member = await MemberModel.findOne({}).lean({ virtuals: true });

        const data = {
          promo: '',
          member: member.id,
        };

        await expect(PromoEnrollmentRequestModel.create(data)).to.eventually
          .rejected;
      });

      it('should throw an error for empty member', async () => {
        const promo = await PromoModel.findOne({}).lean({ virtuals: true });

        const data = {
          promo: promo.id,
          member: '',
        };

        await expect(PromoEnrollmentRequestModel.create(data)).to.eventually
          .rejected;
      });
    });

    context('Given correct values', () => {
      it('should insert member', async () => {
        const member = await MemberModel.findOne({}).lean({ virtuals: true });
        const promo = await PromoModel.findOne({}).lean({ virtuals: true });

        const data = {
          promo: promo.id,
          member: member.id,
        };

        const result = await PromoEnrollmentRequestModel.create(data);

        expect(result).to.be.an('object');
        expect(result.status).to.equal(PromoEnrollmentRequestStatus.Pending);
      });
    });
  });

  describe('Process Promo Enrollment Request', () => {
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

    it('should process promo enrollment request', async function () {
      const result = await PromoEnrollmentRequestModel.findById(
        this.promoEnrollmentRequest.id,
        {
          status: PromoEnrollmentRequestStatus.Processing,
        },
        {
          useFindAndModify: false,
        },
      );

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });

  describe('Approve Promo Enrollment Request', () => {
    it('should approve promo enrollment request', async () => {
      const promoEnrollmentRequest = await PromoEnrollmentRequestModel.findOne(
        {},
      ).lean({ virtuals: true });

      const result = await PromoEnrollmentRequestModel.findById(
        promoEnrollmentRequest.id,
        {
          status: PromoEnrollmentRequestStatus.Approved,
        },
        {
          useFindAndModify: false,
        },
      );

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });

  describe('Reject Promo Enrollment Request', () => {
    it('should reject promo enrollment request', async () => {
      const promoEnrollmentRequest = await PromoEnrollmentRequestModel.findOne(
        {},
      ).lean({ virtuals: true });

      const result = await PromoEnrollmentRequestModel.findById(
        promoEnrollmentRequest.id,
        {
          status: PromoEnrollmentRequestStatus.Rejected,
        },
        {
          useFindAndModify: false,
        },
      );

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });
});
