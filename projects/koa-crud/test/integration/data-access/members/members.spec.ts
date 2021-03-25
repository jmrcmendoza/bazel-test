/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import R from 'ramda';
import server from '@server';
import memberDB from '@dataAccess/members';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Member Data Access', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Create a Member', async () => {
    context('Given values are incorrect', () => {
      it('should throw a validation error for empty username', async () => {
        const data = {
          username: '',
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        await expect(memberDB.createMember(data)).to.eventually.rejected;
      });

      it('should throw a validation error for empty password', async () => {
        const data = {
          username: chance.last(),
          password: '',
          realName: chance.name(),
        };

        await expect(memberDB.createMember(data)).to.eventually.rejected;
      });
    });

    context('Given the values are correct', () => {
      it('should insert and return true', async () => {
        const data = {
          username: chance.last(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        const result = await memberDB.createMember(data);

        expect(result).to.be.true;
      });

      it('should throw error for duplicate username', async () => {
        const members = await memberDB.listMembers();

        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);
        const data = {
          username: lastMember.username,
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        await expect(memberDB.createMember(data)).to.eventually.rejected;
      });
    });
  });

  describe('List Members', () => {
    it('should return all members', async () => {
      const result = await memberDB.listMembers();

      expect(result.edges).to.be.an('array');
      expect(result.totalCount).to.be.greaterThan(0);
    });

    it('should retrive on member', async () => {
      const members = await memberDB.listMembers();

      const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

      const result = await memberDB.selectOneMember(lastMember._id);

      expect(result).to.be.an('object');
      expect(result).to.have.property('username', lastMember.username);
    });
  });

  describe('Update Member', () => {
    context('Given correct values', () => {
      it('should update member password', async () => {
        const members = await memberDB.listMembers();

        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

        const password = chance.string({ lenght: 5 });

        const result = await memberDB.updateMember(lastMember._id, password);

        expect(result).to.be.true;
      });

      it('should throw error for duplicate username', async () => {
        let data = {
          username: chance.last(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        await memberDB.createMember(data);

        const members = await memberDB.listMembers();

        const firstMember = R.compose(R.prop('node'), R.head)(members.edges);
        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

        data = {
          username: firstMember.username,
          password: lastMember.password,
          realName: lastMember.realName,
        };

        await expect(memberDB.updateMember(lastMember._id, data)).to.eventually
          .rejected;
      });
    });
  });

  describe('Delete Member', () => {
    it('should delete one member ', async () => {
      const members = await memberDB.listMembers();

      const lastMemberId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(members.edges);

      const result = await memberDB.deleteMember(lastMemberId);

      expect(result).to.be.true;
    });
  });

  describe('Authenticate Member', () => {
    it('should return false for invalid password', async () => {
      const data = {
        username: 'Jason',
        password: chance.string({ length: 5 }),
      };

      const result = await memberDB.authenticateMember(data);

      expect(result.verified).to.be.false;
    });

    it('should return true for correct password', async () => {
      const data = {
        username: 'Jason',
        password: '1234',
      };

      const result = await memberDB.authenticateMember(data);

      expect(result.verified).to.be.true;
    });
  });
});
