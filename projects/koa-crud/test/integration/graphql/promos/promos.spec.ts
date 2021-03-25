/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Chance from 'chance';
import R from 'ramda';
import PromoModel, { PromoStatus, PromoTemplate } from '@models/promo';
import server from '@server';
import { getLastData } from 'test/helpers/ramda';

const chance = new Chance();

chai.use(chaiHttp);

describe('Promos Graphql', function () {
  before(function () {
    this.request = () => chai.request(server);
  });

  describe('Add Promo', () => {
    context('Given incorrect values', () => {
      it('should return error for empty name', async function () {
        const data = {
          query: `mutation { createPromo(
            input:{
              name: "", 
              template: ${PromoTemplate.Deposit},
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              minimumBalance: ${chance.prime()}
             })
            }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Promo name must be provided.');
      });

      it('should return error for empty template', async function () {
        const data = {
          query: `mutation { createPromo(
            input:{
              name: "${chance.name()}",
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              minimumBalance: ${chance.prime()}
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');
      });

      it('should return error for invalid template', async function () {
        const data = {
          query: `mutation { createPromo(
            input:{
              name: "${chance.name()}",
              template: "Test",
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              minimumBalance: ${chance.prime()}
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');
      });

      it('should return error for empty title', async function () {
        const data = {
          query: `mutation { createPromo(
            input:{
              name: "${chance.name()}",
              template: ${PromoTemplate.Deposit},
              title: "",
              description: "${chance.sentence()}",
              minimumBalance: ${chance.prime()}
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Promo title must be provided');
      });

      it('should return error for empty description', async function () {
        const data = {
          query: `mutation { createPromo(
            input: {
              name: "${chance.name()}",
              template: ${PromoTemplate.Deposit},
              title: "${chance.word()}",
              description: "",
              minimumBalance: ${chance.prime()}
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Description must be provided.');
      });

      it('should return error for empty minimum balance given template is deposit', async function () {
        const data = {
          query: `mutation { createPromo(
            input: {
              name: "${chance.name()}",
              template: ${PromoTemplate.Deposit},
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              minimumBalance: null
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Minimum balance must be provided.');
      });

      it('should return error for empty promo fields given template is sign up', async function () {
        const data = {
          query: `mutation { createPromo(
            input: {
              name: "${chance.name()}",
              template: ${PromoTemplate.SignUp},
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              requiredMemberFields: null
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Members fields must be provided.');
      });

      it('should return error for invalid promo fields given template is sign up', async function () {
        const data = {
          query: `mutation { createPromo(
            input: {
              name: "${chance.name()}",
              template: ${PromoTemplate.SignUp},
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              requiredMemberFields: [ "Test" ]
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Test is an invalid field.');
      });

      it('should return error for invalid status', async function () {
        const data = {
          query: `mutation { createPromo(
            input: {
              name: "${chance.name()}",
              template: ${PromoTemplate.SignUp},
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              requiredMemberFields: [ "REAL_NAME" ],
              status: "Test"
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');
      });
    });

    context('Given correct values', () => {
      it('should insert promo', async function () {
        const data = {
          query: `mutation { createPromo(
            input: {
              name: "${chance.name()}",
              template: ${PromoTemplate.Deposit},
              title: "${chance.word()}",
              description: "${chance.sentence()}",
              minimumBalance: ${chance.prime()}
            })
          }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body.data.createPromo).to.be.true;
      });
    });
  });

  describe('List Promos', () => {
    before(async function () {
      await PromoModel.create(
        R.times(() => ({
          name: chance.name(),
          template: PromoTemplate.Deposit,
          title: chance.word(),
          description: chance.sentence(),
          minimumBalance: chance.natural(),
          createdAt: chance.date(),
        }))(3),
      );
    });

    it('should return all promos', async function () {
      const data = {
        query: `{ promos { 
          totalCount
          edges { 
            node {
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
          }
        } 
      }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data).to.exist;
      expect(result.body.data.promos.totalCount).to.be.greaterThan(0);
      expect(result.body.data.promos.edges).to.be.an('array');
    });

    it('should return true on next page given totalCount is greater than limit', async function () {
      const limit = 2;

      const data = {
        query: `{ promos(limit: ${limit}) { 
          totalCount
          edges { 
            node {
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
      expect(result.body.data.promos.totalCount).to.be.equal(limit);
      expect(result.body.data.promos.pageInfo.hasNextPage).to.be.true;
    });

    it('should return false on next page given last cursor is used', async function () {
      let data = {
        query: `{ promos { 
          pageInfo {
            hasNextPage
            endCursor
          }
        } 
      }`,
      };

      const promos = await this.request().post('/graphql').send(data);

      data = {
        query: `{ promos(after:"${promos.body.data.promos.pageInfo.endCursor}") { 
          totalCount
          edges { 
            node {
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
      expect(result.body.data.promos.totalCount).to.be.equal(1);
      expect(result.body.data.promos.pageInfo.hasNextPage).to.be.false;
    });

    it('should return one promo', async function () {
      let data = {
        query: `{ promos { 
          totalCount
          edges { 
            node {
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
          }
        } 
      }`,
      };

      const promos = await this.request().post('/graphql').send(data);

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promos.body.data.promos.edges);

      data = {
        query: `{ promo(id:"${lastPromoId}") {   
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
       }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data.promo).to.exist;
      expect(result.body.data.promo).to.be.an('object');
    });
  });

  describe('Edit Promo', () => {
    context('Given incorrect values', () => {
      it('should throw error for empty name', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"",
            template: ${PromoTemplate.Deposit},
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            minimumBalance: ${chance.prime()},
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Promo name must be provided.');
      });

      it('should throw error for empty template', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: "",
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            minimumBalance: ${chance.prime()},
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');
      });

      it('should throw error for invalid template', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: Test,
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            minimumBalance: ${chance.prime()},
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');
      });

      it('should throw error for empty title', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: ${PromoTemplate.Deposit},
            title:"",
            description:"${lastPromo.description}",
            minimumBalance: ${chance.prime()},
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Promo title must be provided');
      });

      it('should throw error for empty description', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: ${PromoTemplate.Deposit},
            title:"${lastPromo.title}",
            description:"",
            minimumBalance: ${chance.prime()},
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Description must be provided.');
      });

      it('should throw error for empty minimum balance given the tempate deposit', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: ${PromoTemplate.Deposit},
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            minimumBalance: null,
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Minimum balance must be provided.');
      });

      it('should throw error for empty member fields given the tempate sign up', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: ${PromoTemplate.SignUp},
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            requiredMemberFields: [],
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Members fields must be provided.');
      });

      it('should throw error for invalid member fields given the tempate sign up', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: ${PromoTemplate.SignUp},
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            requiredMemberFields: [ "Test"],
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');

        const error = R.head(result.body.errors);

        expect(error.message).to.equal('Test is an invalid field.');
      });

      it('should throw error for invalid status', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: ${PromoTemplate.SignUp},
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            requiredMemberFields: [ "REAL_NAME"],
            status:"Test"
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body).to.have.property('errors');
      });
    });

    context('Given correct values', () => {
      it('should update promo', async function () {
        let data = {
          query: `{ promos { 
            totalCount
            edges { 
              node {
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
            }
          } 
        }`,
        };

        const promos = await this.request().post('/graphql').send(data);

        const lastPromo = getLastData(promos.body.data.promos.edges);

        data = {
          query: `mutation { updatePromo(id:"${lastPromo.id}", 
          input:{ 
            name:"${lastPromo.name}",
            template: ${PromoTemplate.Deposit},
            title:"${lastPromo.title}",
            description:"${lastPromo.description}",
            minimumBalance: ${chance.prime()},
            status: ${PromoStatus.Active}
          }) 
        }`,
        };

        const result = await this.request().post('/graphql').send(data);

        expect(result.body.data.updatePromo).to.be.true;
      });
    });
  });

  describe('Delete Member', () => {
    before(async function () {
      await PromoModel.deleteMany({});
    });
    it('should delete one member', async function () {
      let data = {
        query: `mutation { createPromo(
          input: {
            name: "${chance.name()}",
            template: ${PromoTemplate.Deposit},
            title: "${chance.word()}",
            description: "${chance.sentence()}",
            minimumBalance: ${chance.prime()}
          })
        }`,
      };

      await this.request().post('/graphql').send(data);

      data = {
        query: `{ promos { 
          totalCount
          edges { 
            node {
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
          }
        } 
      }`,
      };

      const promos = await this.request().post('/graphql').send(data);

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promos.body.data.promos.edges);

      data = {
        query: `mutation { deletePromo(id:"${lastPromoId}") }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body.data).to.have.property('deletePromo', true);
    });

    it('should throw an error for deleting active promo', async function () {
      let data = {
        query: `mutation { createPromo(
          input: {
            name: "${chance.name()}",
            template: ${PromoTemplate.Deposit},
            title: "${chance.word()}",
            description: "${chance.sentence()}",
            minimumBalance: ${chance.prime()},
            status: ${PromoStatus.Active}
          })
        }`,
      };

      await this.request().post('/graphql').send(data);

      data = {
        query: `{ promos { 
          totalCount
          edges { 
            node {
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
          }
        } 
      }`,
      };

      const promos = await this.request().post('/graphql').send(data);

      const lastPromoId = R.compose(
        R.prop('id'),
        R.prop('node'),
        R.last,
      )(promos.body.data.promos.edges);

      data = {
        query: `mutation { deletePromo(id:"${lastPromoId}") }`,
      };

      const result = await this.request().post('/graphql').send(data);

      expect(result.body).to.have.property('errors');

      const error = R.head(result.body.errors);

      expect(error.message).to.equal('Cannot delete active promo.');
    });
  });
});
