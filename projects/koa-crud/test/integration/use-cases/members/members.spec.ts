/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import R from 'ramda';
import Chance from 'chance';
import server from '@server';
import {
  insertMember,
  listMembers,
  selectMember,
  updateMember,
  deleteMember,
} from '@useCases/members';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Member Use Case', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Add Member', () => {
    context('Given incorrect values', () => {
      it('should throw an error for empty username', async () => {
        const data = {
          username: '',
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        await expect(
          insertMember(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'MEMBER_VALIDATION_ERROR',
        );
        await expect(insertMember(data)).to.eventually.rejectedWith(
          'Username must be provided.',
        );
      });

      it('should throw an error for empty password', async () => {
        const data = {
          username: chance.last(),
          password: '',
          realName: chance.name(),
        };

        await expect(
          insertMember(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'MEMBER_VALIDATION_ERROR',
        );
        await expect(insertMember(data)).to.eventually.rejectedWith(
          'Password must be provided.',
        );
      });
    });

    context('Given correct values', () => {
      it('should insert member and return true', async () => {
        const data = {
          username: chance.last(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        const result = await insertMember(data);

        expect(result).to.exist;
        expect(result).to.be.true;
      });

      it('should throw error for duplicate username', async () => {
        const members = await listMembers();

        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

        const data = {
          username: lastMember.username,
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        await expect(insertMember(data)).to.eventually.rejected;
      });
    });
  });

  describe('List Members', () => {
    it('should return all members', async () => {
      const result = await listMembers();

      expect(result).to.exist;
      expect(result.edges).to.be.an('array');
      expect(result.totalCount).to.be.greaterThan(0);
    });

    it('should return one member', async () => {
      const member = await listMembers();

      const lastMemberId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(member.edges);

      const result = await selectMember(lastMemberId);

      expect(result).to.exist;
      expect(result).to.be.an('object');
    });
  });

  describe('Edit Member', () => {
    context('Given incorrect values', () => {
      it('should throw an error for empty username', async () => {
        const members = await listMembers();

        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

        const data = {
          username: '',
          password: lastMember.password,
          realName: lastMember.realName,
        };

        await expect(
          insertMember(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'MEMBER_VALIDATION_ERROR',
        );
        await expect(
          updateMember(lastMember._id, data),
        ).to.eventually.rejectedWith('Username must be provided.');
      });

      it('should throw an error for empty password', async () => {
        const members = await listMembers();

        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

        const data = {
          username: lastMember.username,
          password: '',
          realName: lastMember.realName,
        };

        await expect(
          insertMember(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'MEMBER_VALIDATION_ERROR',
        );
        await expect(
          updateMember(lastMember._id, data),
        ).to.eventually.rejectedWith('Password must be provided.');
      });
    });

    context('Given correct values', () => {
      it('should update member and return true', async () => {
        const members = await listMembers();

        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

        const data = {
          username: lastMember.username,
          password: chance.string({ length: 5 }),
          realName: lastMember.realName,
        };

        const result = await updateMember(lastMember._id, data);

        expect(result).to.be.true;
      });

      it('should throw error for duplicate username', async () => {
        let data = {
          username: chance.last(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        const members = await listMembers();

        const firstMember = R.compose(R.prop('node'), R.head)(members.edges);
        const lastMember = R.compose(R.prop('node'), R.last)(members.edges);

        data = {
          username: firstMember.username,
          password: lastMember.password,
          realName: lastMember.realName,
        };

        await expect(updateMember(lastMember._id, data)).to.eventually.rejected;
      });
    });
  });

  describe('Delete Member', () => {
    it('should delete one vendor', async () => {
      const members = await listMembers();

      const lastMemberId = R.compose(
        R.prop('_id'),
        R.prop('node'),
        R.last,
      )(members.edges);

      const result = await deleteMember(lastMemberId);

      expect(result).to.be.true;
    });
  });
});
