/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Chance from 'chance';
import R from 'ramda';
import promoDB from '@dataAccess/promos';
import server from '@server';
import MemberModel from '@models/member';
import { createHash } from '@encryption';
import PromoModel, { PromoStatus, PromoTemplate } from '@models/promo';
import PromoEnrollmentRequestModel from '@models/promo-enrollment-requests';
import { getLastDataId } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);

describe('Promos Graphql', function () {
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

  describe('Enroll to Promo', () => {
    context('Given incorrect values', () => {
      it('should return error for empty promo', async function () {
        const data = {
          query: `mutation { enrollToPromo(
            promo:""
          )
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Promo must be provided.');
      });

      it('should return error for empty member', async function () {
        const promos = await promoDB.listPromos();

        const lastPromoId = getLastDataId(promos.edges);

        const data = {
          query: `mutation { enrollToPromo(
            promo:"${lastPromoId}"
          )
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Member must be provided.');
      });
    });

    context('Given correct values', () => {
      it('should return error for missing member fields', async function () {
        const token = await this.getToken();

        const promoDetails = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: ['BANK_ACCOUNT'],
          status: PromoStatus.Active,
        };

        await promoDB.createPromo(promoDetails);

        const promos = await promoDB.listPromos();

        const lastPromoId = getLastDataId(promos.edges);

        const data = {
          query: `mutation { enrollToPromo(
            promo:"${lastPromoId}"
          )
        }`,
        };

        const result = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('BANK_ACCOUNT member field is missing.');
      });

      it('should return error for enrolling to draft promo', async function () {
        const token = await this.getToken();

        const promoDetails = {
          name: chance.name(),
          template: PromoTemplate.SignUp,
          title: chance.word(),
          description: chance.sentence(),
          requiredMemberFields: ['BANK_ACCOUNT'],
        };

        await promoDB.createPromo(promoDetails);

        const promos = await promoDB.listPromos();

        const lastPromoId = getLastDataId(promos.edges);

        const data = {
          query: `mutation { enrollToPromo(
            promo:"${lastPromoId}"
          )
        }`,
        };

        const result = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal(
          'Cannot enroll to Inactive/Draft promo.',
        );
      });

      it('should enroll to a promo and return true', async function () {
        const token = await this.getToken();

        const promoDetails = {
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.prime(),
          status: PromoStatus.Active,
        };

        await promoDB.createPromo(promoDetails);

        const promos = await promoDB.listPromos();

        const lastPromoId = getLastDataId(promos.edges);

        const data = {
          query: `mutation { enrollToPromo(
            promo:"${lastPromoId}"
          )
        }`,
        };

        const result = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer ${token}`);

        expect(result.body.data.enrollToPromo).to.be.true;
      });
    });

    context('Given invalid token', () => {
      it('should throw forbidden', async function () {
        const promos = await promoDB.listPromos();

        const lastPromoId = getLastDataId(promos.edges);

        const data = {
          query: `mutation { enrollToPromo(
            promo:"${lastPromoId}"
          )
        }`,
        };

        const result = await this.request()
          .post('/graphql')
          .send(data)
          .set('authorization', `Bearer token`);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Forbidden');
      });
    });
  });

  describe('List Promo Enrollment Requests', () => {
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

      R.times(async () => {
        await PromoEnrollmentRequestModel.create({
          promo: promo.id,
          member: member.id,
          createdAt: chance.date(),
        });
      }, 3);
    });
    it('should return all promo enrollment requests', async function () {
      const data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data).to.exist;
      expect(
        result.body.data.promoEnrollmentRequests.totalCount,
      ).to.be.greaterThan(0);
      expect(result.body.data.promoEnrollmentRequests.edges).to.be.an('array');
    });

    it('should return true on next page given totalCount is greater than limit', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          pageInfo {
              hasNextPage
              endCursor
          }       
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      data = {
        query: `{ promoEnrollmentRequests(after:"${promoEnrollmentRequests.body.data.promoEnrollmentRequests.pageInfo.endCursor}") {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }   
          pageInfo {
            hasNextPage
            endCursor
          }       
        } 
      }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data).to.exist;
      expect(result.body.data.promoEnrollmentRequests.totalCount).to.be.equal(
        1,
      );
      expect(result.body.data.promoEnrollmentRequests.pageInfo.hasNextPage).to
        .be.false;
    });

    it('should return one promo enrollment request', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      const lastPromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.body.data.promoEnrollmentRequests.edges);

      data = {
        query: `{ promoEnrollmentRequest(id:"${lastPromoEnrollmentRequestId}") {
          id
          promo { 
            id
            name
            template
            title
            description
            ...on SignUpPromo {
              requiredMemberFields
           }    
            ...on DepositPromo{
              minimumBalance
            }
            status
          }
          member {
            id
            username
            realName
            email
            bankAccount
          }
          status
        } 
      }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data.promoEnrollmentRequest).to.exist;
      expect(result.body.data.promoEnrollmentRequest).to.be.an('object');
    });

    it('should throw an error for invalid token', async function () {
      const data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const result = await this.request()
        .post('/graphql')
        .send(data)
        .set('authorization', `Bearer token`);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('Forbidden');
    });
  });

  describe('Process Promo Enrollment Request', () => {
    it('should throw an error for empty id', async function () {
      const data = {
        query: `mutation { processPromoEnrollmentRequest(
          id:""
        ) }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('ID must be provided.');
    });

    it('should process request and return true', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      const lastPromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.body.data.promoEnrollmentRequests.edges);

      data = {
        query: `mutation { processPromoEnrollmentRequest(
          id:"${lastPromoEnrollmentRequestId}"
        )}`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data.processPromoEnrollmentRequest).to.be.true;
    });

    it('should throw error for invalid token', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      const lastPromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.body.data.promoEnrollmentRequests.edges);

      data = {
        query: `mutation { processPromoEnrollmentRequest(
          id:"${lastPromoEnrollmentRequestId}"
        )}`,
      };

      const result = await this.request()
        .post('/graphql')
        .send(data)
        .set('authorization', `Bearer token`);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('Forbidden');
    });
  });

  describe('Approve Promo Enrollment Request', () => {
    it('should throw an error for empty id', async function () {
      const data = {
        query: `mutation { approvePromoEnrollmentRequest(
          id:""
        ) }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('ID must be provided.');
    });

    it('should approve request and return true', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      const lastPromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.body.data.promoEnrollmentRequests.edges);

      data = {
        query: `mutation { approvePromoEnrollmentRequest(
          id:"${lastPromoEnrollmentRequestId}"
        )}`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data.approvePromoEnrollmentRequest).to.be.true;
    });

    it('should throw error for invalid token', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      const lastPromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.body.data.promoEnrollmentRequests.edges);

      data = {
        query: `mutation { approvePromoEnrollmentRequest(
          id:"${lastPromoEnrollmentRequestId}"
        )}`,
      };

      const result = await this.request()
        .post('/graphql')
        .send(data)
        .set('authorization', `Bearer token`);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('Forbidden');
    });
  });

  describe('Reject Promo Enrollment Request', () => {
    it('should throw an error for empty id', async function () {
      const data = {
        query: `mutation { rejectPromoEnrollmentRequest(
          id:""
        ) }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('ID must be provided.');
    });

    it('should reject request and return true', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      const lastPromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.body.data.promoEnrollmentRequests.edges);

      data = {
        query: `mutation { rejectPromoEnrollmentRequest(
          id:"${lastPromoEnrollmentRequestId}"
        )}`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data.rejectPromoEnrollmentRequest).to.be.true;
    });

    it('should throw error for invalid token', async function () {
      let data = {
        query: `{ promoEnrollmentRequests {
          totalCount
          edges {
            node {
              id
              promo { 
                id
                name
                template
                title
                description
                ...on SignUpPromo {
                  requiredMemberFields
                }    
                ...on DepositPromo{
                  minimumBalance
                }
                status
              }
              member {
                id
                username
                realName
                email
                bankAccount
              }
              status
            }
          }         
        } 
      }`,
      };

      const promoEnrollmentRequests = await this.request()
        .post('/graphql')
        .send(data);

      const lastPromoEnrollmentRequestId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promoEnrollmentRequests.body.data.promoEnrollmentRequests.edges);

      data = {
        query: `mutation { rejectPromoEnrollmentRequest(
          id:"${lastPromoEnrollmentRequestId}"
        )}`,
      };

      const result = await this.request()
        .post('/graphql')
        .send(data)
        .set('authorization', `Bearer token`);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('Forbidden');
    });
  });
});
