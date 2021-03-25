/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';

import Chance from 'chance';
import server from '@server';
import { authenticateMember } from '@useCases/authenticate';
import { insertMember } from '@useCases/members';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Member Use Case', () => {
  before(async function () {
    this.request = () => chai.request(server);

    await insertMember({
      username: 'Jason',
      password: '1234',
      realName: 'Jason Marc',
      email: 'test@gmail.com',
    });
  });

  describe('Authenticate Member', () => {
    context('Given incorrect values', () => {
      it('should throw an error for empty username', async () => {
        const data = {
          username: '',
          password: chance.string({ lenght: 5 }),
        };

        await expect(
          authenticateMember(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'MEMBER_VALIDATION_ERROR',
        );
        await expect(authenticateMember(data)).to.eventually.rejectedWith(
          'Username must be provided.',
        );
      });

      it('should throw an error for empty password', async () => {
        const data = {
          username: chance.last(),
          password: '',
        };

        await expect(
          authenticateMember(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'MEMBER_VALIDATION_ERROR',
        );
        await expect(authenticateMember(data)).to.eventually.rejectedWith(
          'Password must be provided.',
        );
      });
    });

    context('Given correct values', () => {
      it('should throw an error for invalid password', async () => {
        const data = {
          username: 'Jason',
          password: chance.string({ lenght: 5 }),
        };

        await expect(
          authenticateMember(data),
        ).to.eventually.rejected.and.to.have.property(
          'name',
          'AUTHENTICATE_ERROR',
        );
        await expect(authenticateMember(data)).to.eventually.rejectedWith(
          'Authenticate failed.',
        );
      });

      it('should return token', async () => {
        const data = {
          username: 'Jason',
          password: '1234',
        };

        const result = await authenticateMember(data);

        expect(result).to.have.property('token');
      });
    });
  });
});
