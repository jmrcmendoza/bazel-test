/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import R from 'ramda';
import MemberModel, { MemberDocument } from '@models/member';
import DBManager from '../tear-down';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Member Model', () => {
  before(async function () {
    this.dbManager = new DBManager();

    await this.dbManager.start();
  });

  describe('Create Member', () => {
    context('Given incorrect values', () => {
      it('should throw an error for empty username', async () => {
        const data = {
          username: '',
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        await expect(MemberModel.create(data)).to.eventually.rejected;
      });

      it('should throw an error for empty password', async () => {
        const data = {
          username: chance.last(),
          password: '',
          realName: chance.name(),
        };

        await expect(MemberModel.create(data)).to.eventually.rejected;
      });
    });

    context('Given correct values', () => {
      beforeEach(async function () {
        await MemberModel.deleteMany({});
      });

      it('should insert member', async () => {
        const data = {
          username: chance.last(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        const result = await MemberModel.create(data);

        expect(result).to.be.an('object');
        expect(result.username).to.equal(data.username);
      });

      it('should throw error for duplicate username', async () => {
        const username = chance.word();

        await expect(
          MemberModel.create(
            R.times(() => ({
              username,
              password: chance.string({ length: 5 }),
              realName: chance.name(),
            }))(2),
          ),
        ).to.eventually.rejected;
      });
    });
  });

  describe('List Members', () => {
    it('should retrieve all members', async () => {
      const result = await MemberModel.find({}).lean();

      expect(result).to.be.an('array');
      expect(result).to.have.length.greaterThan(0);
    });

    it('should retrieve one members', async () => {
      const member = await MemberModel.findOne({}).lean();

      const result = await MemberModel.findById(member._id);

      expect(result).to.be.an('object');
      expect(result.username).to.equal(member.username);
    });
  });

  describe('Edit Member', () => {
    it('should update and return member values', async () => {
      const member = await MemberModel.findOne({}).lean();

      const password = chance.string({ length: 5 });

      const result = await MemberModel.findByIdAndUpdate(
        member._id,
        { password },
        {
          useFindAndModify: false,
        },
      );

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });

    it('should throw an error for duplicate username', async () => {
      let data = {
        username: chance.last(),
        password: chance.string({ length: 5 }),
        realName: chance.name(),
      };

      await MemberModel.create(data);

      const members: MemberDocument[] = await MemberModel.find({}).lean();

      const firstMember = R.head(members)!;
      const lastMember = R.last(members)!;

      data = {
        username: firstMember.username,
        password: lastMember.password,
        realName: lastMember.realName!,
      };

      await expect(
        MemberModel.findByIdAndUpdate(lastMember._id, data, {
          useFindAndModify: false,
        }),
      ).to.eventually.rejected;
    });
  });

  describe('Delete Member', () => {
    it('should delete one member', async () => {
      const member = await MemberModel.findOne({}).lean();

      const result = await MemberModel.findByIdAndDelete(member._id);

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });
});
