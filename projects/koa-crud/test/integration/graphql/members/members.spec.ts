/* eslint-disable no-return-await */
/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Chance from 'chance';
import R from 'ramda';
import server from '@server';

import MemberModel from '@models/member';
import { getFirstData, getLastData, getLastDataId } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);

describe('Members', function () {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Add member', () => {
    context('Given incorrect values', () => {
      it('should return error for empty username', async function () {
        const data = {
          query: `mutation { createMember(input:{ username:"", password:"${chance.string(
            { length: 5 },
          )}"}) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response.body).to.have.property('errors');
      });

      it('should return error for empty passowrd', async function () {
        const data = {
          query: `mutation { createMember(input:{ username:"${chance.last()}", password:""}) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response.body).to.have.property('errors');
      });
    });

    context('Given correct values', () => {
      it('should insert member', async function () {
        const data = {
          query: `mutation { createMember(input:{ username:"${chance.last()}", password:"${chance.string(
            { length: 5 },
          )}", realName:"${chance.name()}"}) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response).to.have.property('status', 200);
        expect(response.body.data.createMember).to.be.true;
      });

      it('should throw error for duplicate username', async function () {
        let data = {
          query: `{ members { 
            totalCount
            edges {
              node {
                id
                username
                realName
              }
              cursor            
            }
          } 
        }`,
        };

        const members = await this.request().post('/graphql').send(data);

        const lastMember = getLastData(members.body.data.members.edges);

        data = {
          query: `mutation { createMember(input:{ username:"${
            lastMember.username
          }", password:"${chance.string({
            length: 5,
          })}", realName:"${chance.name()}"}) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response.body).to.have.property('errors');
      });
    });
  });

  describe('List Members', () => {
    before(async function () {
      await MemberModel.create(
        R.times(() => ({
          username: chance.word(),
          password: chance.string({ length: 5 }),
          realName: chance.name(),
          createdAt: chance.date(),
        }))(3),
      );
    });

    it('should return all members', async function () {
      const data = {
        query: `{ members { 
          totalCount
          edges {
            node {
              id
              username
              realName
            }
            cursor            
          }
        } 
      }`,
      };

      const response = await this.request().post('/graphql').send(data);

      expect(response.body.data).to.exist;
      expect(response.body.data.members.totalCount).to.be.greaterThan(0);
      expect(response.body.data.members.edges).to.be.an('array');
    });

    it('should return true on next page given totalCount is greater than limit', async function () {
      const limit = 2;

      const data = {
        query: `{ members(limit:${limit}) { 
          totalCount
          edges {
            node {
              id
              username
              realName
            }
            cursor            
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        } 
      }`,
      };

      const response = await this.request().post('/graphql').send(data);

      expect(response.body.data).to.exist;
      expect(response.body.data.members.totalCount).to.be.equal(limit);
      expect(response.body.data.members.pageInfo.hasNextPage).to.be.true;
    });

    it('should return false on next page given last cursor is used', async function () {
      let data = {
        query: `{ members { 
          pageInfo {
            hasNextPage
            endCursor
          }
        } 
      }`,
      };

      const members = await this.request().post('/graphql').send(data);

      data = {
        query: `{ members(after:"${members.body.data.members.pageInfo.endCursor}") { 
          totalCount
          edges {
            node {
              id
              username
              realName
            }
            cursor            
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        } 
      }`,
      };

      const response = await this.request().post('/graphql').send(data);

      expect(response.body.data).to.exist;
      expect(response.body.data.members.totalCount).to.be.equal(1);
      expect(response.body.data.members.pageInfo.hasNextPage).to.be.false;
    });

    it('should return one member', async function () {
      let data = {
        query: `{ members { 
          totalCount
          edges {
            node {
              id
              username
              realName
            }
            cursor            
          }
        } 
      }`,
      };

      const members = await this.request().post('/graphql').send(data);

      const lastMemberId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(members.body.data.members.edges);

      data = {
        query: `{ member(id:"${lastMemberId}") { id username realName } }`,
      };

      const response = await this.request().post('/graphql').send(data);

      expect(response.body.data.member).to.exist;
      expect(response.body.data.member).to.be.an('object');
    });
  });

  describe('Edit Member', () => {
    context('Given incorrect values', () => {
      it('should throw error for empty username', async function () {
        let data = {
          query: `{ members { 
            totalCount
            edges {
              node {
                id
                username
                realName
              }
              cursor            
            }
          } 
        }`,
        };

        const members = await this.request().post('/graphql').send(data);

        const lastMemberId = getLastDataId(members.body.data.members.edges);

        data = {
          query: `mutation { updateMember(id:"${lastMemberId}", input:{ username:null, password:"${chance.string(
            { length: 5 },
          )}"}) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response.body).to.have.property('errors');
      });

      it('should throw error for null password', async function () {
        let data = {
          query: `{ members { 
            totalCount
            edges {
              node {
                id
                username
                realName
              }
              cursor            
            }
          } 
        }`,
        };

        const members = await this.request().post('/graphql').send(data);

        const lastMemberId = getLastDataId(members.body.data.members.edges);

        data = {
          query: `mutation { updateMember(id:"${lastMemberId}", input:{ username:"${chance.name()}", password:null }) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response.body).to.have.property('errors');
      });
    });

    context('Given correct values', () => {
      it('should update member', async function () {
        let data = {
          query: `{ members { 
            totalCount
            edges {
              node {
                id
                username
                realName
              }
              cursor            
            }
          } 
        }`,
        };

        const members = await this.request().post('/graphql').send(data);

        const lastMember = getLastData(members.body.data.members.edges);

        data = {
          query: `mutation { updateMember(id:"${
            lastMember.id
          }", input:{ username:"${
            lastMember.username
          }", password:"${chance.string({ length: 5 })}"}) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response.body.data).to.have.property('updateMember', true);
      });

      it('should throw error for duplicate username', async function () {
        let data = {
          query: `mutation { createMember(input:{ username:"${chance.last()}", password:"${chance.string(
            { length: 5 },
          )}", realName:"${chance.name()}"}) }`,
        };

        await this.request().post('/graphql').send(data);

        data = {
          query: `{ members { 
            totalCount
            edges {
              node {
                id
                username
                realName
              }
              cursor            
            }
          } 
        }`,
        };

        const members = await this.request().post('/graphql').send(data);

        const firstMember = getFirstData(members.body.data.members.edges);
        const lastMember = getLastData(members.body.data.members.edges);

        data = {
          query: `mutation { updateMember(id:"${
            lastMember.id
          }", input:{ username:"${
            firstMember.username
          }", password:"${chance.string({ lenght: 5 })}" }) }`,
        };

        const response = await this.request().post('/graphql').send(data);

        expect(response.body).to.have.property('errors');
      });
    });
  });

  describe('Delete Member', () => {
    it('should delete one member', async function () {
      let data = {
        query: `{ members { 
          totalCount
          edges {
            node {
              id
              username
              realName
            }
            cursor            
          }
        } 
      }`,
      };

      const members = await this.request().post('/graphql').send(data);

      const lastMemberId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(members.body.data.members.edges);

      data = {
        query: `mutation { deleteMember(id:"${lastMemberId}") }`,
      };

      const response = await this.request().post('/graphql').send(data);

      expect(response.body.data).to.have.property('deleteMember', true);
    });
  });
});
