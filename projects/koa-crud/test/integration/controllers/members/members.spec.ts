/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import R from 'ramda';
import server from '@server';
import {
  delMember,
  getMembers,
  getOneMember,
  postMember,
  putMember,
} from '@controllers/members';
import { getFirstData, getLastData } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Member Controller', () => {
  before(function () {
    this.request = () => chai.request(server);
  });

  after(async function () {
    server.close();
  });

  describe('Create Member', () => {
    context('Given incorrect values', () => {
      it('should return 400 status code for empty username', async () => {
        const data = {
          body: {
            username: '',
            password: chance.string({ length: 5 }),
            realName: chance.name(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postMember(data);

        expect(result).to.have.property('status', 400);
      });

      it('should return 400 status code for empty password', async () => {
        const data = {
          body: {
            username: chance.last(),
            password: '',
            realName: chance.name(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postMember(data);

        expect(result).to.have.property('status', 400);
      });
    });

    context('Given correct values', () => {
      it('should insert member and return 200 status code', async () => {
        const data = {
          body: {
            username: chance.last(),
            password: chance.string({ length: 5 }),
            realName: chance.name(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await postMember(data);

        expect(result).to.have.property('status', 201);
        expect(result.body).to.be.true;
      });

      it('should return 400 status code for duplicate username', async () => {
        const data = {
          query: {},
          body: {},
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };
        const members = await getMembers(data);

        const lastMember = getLastData(members.body.edges);

        data.body = {
          username: lastMember.username,
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        };

        const result = await postMember(data);

        expect(result).to.have.property('status', 400);
      });
    });
  });

  describe('List Members', () => {
    it('should retrieve all members and return 200 status code', async () => {
      const data = {
        query: {},
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };
      const result = await getMembers(data);

      expect(result).to.have.property('status', 200);
      expect(result.body.totalCount).to.be.greaterThan(0);
    });

    it('should retrieve one member and return 200 status code', async () => {
      const data = {
        query: {},
        params: {},
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };

      const members = await getMembers(data);

      data.params = {
        id: R.compose(
          R.prop('_id'),
          R.prop('node'),
          R.last,
        )(members.body.edges),
      };

      const result = await getOneMember(data);

      expect(result).to.have.property('status', 200);
      expect(result.body).to.be.an('object');
    });
  });

  describe('Edit Members', () => {
    context('Given incorrect values', () => {
      it('should return 400 status code for empty usename', async () => {
        const data = {
          query: {},
          body: {},
          params: {},
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };
        const members = await getMembers(data);

        const lastMember = getLastData(members.body.edges);

        data.params = { id: lastMember._id };
        data.body = {
          username: '',
          password: chance.string({ length: 5 }),
          realName: lastMember.realName,
        };

        const result = await putMember(data);

        expect(result).to.have.property('status', 400);
      });
    });

    context('Given correct values', () => {
      it('should update last member and return 200 status code', async () => {
        const data = {
          query: {},
          body: {},
          params: {},
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };
        const members = await getMembers(data);

        const lastMember = getLastData(members.body.edges);

        data.params = { id: lastMember._id };
        data.body = {
          username: lastMember.username,
          password: chance.string({ length: 5 }),
          realName: lastMember.realName,
        };

        const result = await putMember(data);

        expect(result).to.have.property('status', 200);
        expect(result.body).to.be.true;
      });

      it('should insert member and return 400 status code for duplicate username update', async () => {
        let data = {
          query: {},
          params: {},
          body: {
            username: chance.last(),
            password: chance.string({ length: 5 }),
            realName: chance.name(),
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        await postMember(data);

        const members = await getMembers(data);

        const firstMember = getFirstData(members.body.edges);
        const lastMember = getLastData(members.body.edges);

        data = {
          query: {},
          params: { id: lastMember._id },
          body: {
            username: firstMember.username,
            password: chance.string({ length: 5 }),
            realName: lastMember.realName,
          },
          headers: {
            'Content-Type': null,
            Referer: null,
            'User-Agent': null,
          },
        };

        const result = await putMember(data);

        expect(result).to.have.property('status', 400);
      });
    });
  });

  describe('Delete Member', () => {
    it('should delete member and return 200 status code', async () => {
      const data = {
        query: {},
        params: {},
        body: {
          username: chance.last(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
        },
        headers: {
          'Content-Type': null,
          Referer: null,
          'User-Agent': null,
        },
      };

      const members = await getMembers(data);

      data.params = {
        id: R.compose(
          R.prop('_id'),
          R.prop('node'),
          R.last,
        )(members.body.edges),
      };

      const result = await delMember(data);

      expect(result).to.have.property('status', 200);
      expect(result.body).to.be.true;
    });
  });
});
