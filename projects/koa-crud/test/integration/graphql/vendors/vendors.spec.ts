/* eslint-disable no-return-await */
/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Chance from 'chance';
import R from 'ramda';
import MemberModel from '@models/member';
import VendorModel, { VendorType } from '@models/vendor';
import { createHash } from '@encryption';

import server from '@server';
import { getLastData, getLastDataId } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);

describe('Vendors', function () {
  before(async function () {
    this.request = () => chai.request(server);

    const password = '1234';

    const memberData = {
      username: chance.word(),
      password: await createHash(password),
    };

    await MemberModel.create(memberData);

    this.getToken = async () => {
      const data = {
        query: `mutation { authenticate(
          input: { 
            username: "${memberData.username}",
            password: "${password}"
          }){ 
            token 
          }
        }`,
      };

      const result = await this.request().post('/graphql').send(data);

      return result.body.data.authenticate.token;
    };
  });

  describe('Add vendor', () => {
    context('Given incorrect values', () => {
      it('should return error for null vendor name', async function () {
        const token = await this.getToken();

        const data = {
          query: `mutation { createVendor(input:{ name:null, type:${VendorType.Seamless}}) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body).to.have.property('errors');
      });

      it('should return error for null vendor type', async function () {
        const token = await this.getToken();

        const data = {
          query: `mutation { createVendor(input:{ name:${chance.name()}, type:null}) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body).to.have.property('errors');
      });
    });

    context('Given correct values', () => {
      it('should insert vendor', async function () {
        const token = await this.getToken();
        const data = {
          query: `mutation { createVendor(input:{ name:"${chance.name()}", type:${
            VendorType.Seamless
          }}) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response).to.have.property('status', 200);
        expect(response.body.data.createVendor).to.be.true;
      });
    });

    context('Given invalid token', () => {
      it('should throw an error for forbidden', async function () {
        const data = {
          query: `mutation { createVendor(input:{ name:"${chance.name()}", type:${
            VendorType.Seamless
          }}) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .set('authorization', 'Bearer token')
          .send(data);

        expect(response.body).to.have.property('errors');
      });
    });
  });

  describe('List Vendors', () => {
    before(async function () {
      await VendorModel.create(
        R.times(() => ({
          name: chance.name(),
          type: VendorType.Seamless,
          createdAt: chance.date(),
        }))(3),
      );
    });

    context('Given valid token', () => {
      it('should return all vendors', async function () {
        const token = await this.getToken();

        const data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body.data).to.exist;
        expect(response.body.data.vendors.totalCount).to.be.greaterThan(0);
        expect(response.body.data.vendors.edges).to.be.an('array');
      });

      it('should return true on next page given totalCount is greater than limit', async function () {
        const token = await this.getToken();

        const limit = 2;

        const data = {
          query: `{ vendors(limit: ${limit}) { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
            pageInfo {
              hasNextPage
              endCursor
            }
          } 
        }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body.data).to.exist;
        expect(response.body.data.vendors.totalCount).to.be.equal(limit);
        expect(response.body.data.vendors.pageInfo.hasNextPage).to.be.true;
      });

      it('should return false on next page given last cursor is used', async function () {
        const token = await this.getToken();

        let data = {
          query: `{ vendors{ 
            pageInfo {
              hasNextPage
              endCursor
            }
          } 
        }`,
        };

        const vendors = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        data = {
          query: `{ vendors(after:"${vendors.body.data.vendors.pageInfo.endCursor}") { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
            pageInfo {
              hasNextPage
              endCursor
            }
          } 
        }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body.data).to.exist;
        expect(response.body.data.vendors.totalCount).to.be.equal(1);
        expect(response.body.data.vendors.pageInfo.hasNextPage).to.be.false;
      });

      it('should return one vendor', async function () {
        const token = await this.getToken();

        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendorId = getLastDataId(vendors.body.data.vendors.edges);

        data = {
          query: `{ vendor(id:"${lastVendorId}") { id name type } }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body.data.vendor).to.exist;
        expect(response.body.data.vendor).to.be.an('object');
      });
    });

    context('Given invalid token', () => {
      it('should throw an error for invalid token', async function () {
        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendorId = getLastDataId(vendors.body.data.vendors.edges);

        data = {
          query: `{ vendor(id:"${lastVendorId}") { id name type } }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer token`);

        expect(response.body).to.have.property('errors');
      });
    });
  });

  describe('Edit Vendor', () => {
    context('Given incorrect values', () => {
      it('should throw error for null name', async function () {
        const token = await this.getToken();

        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendorId = getLastDataId(vendors.body.data.vendors.edges);

        data = {
          query: `mutation { updateVendor(id:"${lastVendorId}", input:{ name:null, type:${VendorType.Seamless}}) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body).to.have.property('errors');
      });

      it('should throw error for null type', async function () {
        const token = await this.getToken();

        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendorId = getLastDataId(vendors.body.data.vendors.edges);

        data = {
          query: `mutation { updateVendor(id:"${lastVendorId}", input:{ name:"${chance.name()}", type:null }) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body).to.have.property('errors');
      });

      it('should throw error for invalid type', async function () {
        const token = await this.getToken();
        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendorId = getLastDataId(vendors.body.data.vendors.edges);

        data = {
          query: `mutation { updateVendor(id:"${lastVendorId}", input:{ name:"${chance.name()}", type:"TEST" }) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body).to.have.property('errors');
      });
    });

    context('Given correct values', () => {
      it('should update vendor', async function () {
        const token = await this.getToken();

        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendor = getLastData(vendors.body.data.vendors.edges);

        data = {
          query: `mutation { updateVendor(id:"${lastVendor.id}", input:{ name:"${lastVendor.name}", type:${VendorType.Transfer}}) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.status).to.equal(200);
        expect(response.body.data).to.have.property('updateVendor', true);
      });
    });

    context('Given invalid token', () => {
      it('should thrown an error for invalid token', async function () {
        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendor = getLastData(vendors.body.data.vendors.edges);

        data = {
          query: `mutation { updateVendor(id:"${lastVendor.id}", input:{ name:"${lastVendor.name}", type:${VendorType.Transfer}}) }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer token`);

        expect(response.body).to.have.property('errors');
      });
    });
  });

  describe('Delete Vendor', () => {
    context('Given valid token', () => {
      it('should delete one vendor', async function () {
        const token = await this.getToken();

        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        const lastVendorId = getLastDataId(vendors.body.data.vendors.edges);

        data = {
          query: `mutation { deleteVendor(id:"${lastVendorId}") }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(response.body.data).to.have.property('deleteVendor', true);
      });
    });

    context('Given invalid token', () => {
      it('should throw an error for invalid token', async function () {
        let data = {
          query: `{ vendors { 
            totalCount
            edges {
              node {
                id 
                name 
                type                
              }
            } 
          } 
        }`,
        };

        const vendors = await this.request().post('/graphql').send(data);

        const lastVendorId = getLastDataId(vendors.body.data.vendors.edges);

        data = {
          query: `mutation { deleteVendor(id:"${lastVendorId}") }`,
        };

        const response = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer token`);

        expect(response.body).to.have.property('errors');
      });
    });
  });
});
