/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';

import chance from 'test/helpers/chance';
import request from 'test/helpers/request';

import 'test/api/common';

describe('Authenticate API', () => {
  describe('POST /authenticate', () => {
    it('should call the `authenticateController`', async function () {
      await request
        .post('/authenticate')
        .set('Integration-Key', chance.guid())
        .send({ person: chance.guid() });

      expect(this.authenticateController.calledOnce).to.be.true;
      const args = this.authenticateController.args[0][0];
      expect(args).to.have.property('path', '/authenticate');
      expect(args.get('Integration-Key')).to.be.a('string');
      expect(args)
        .to.have.nested.property('request.body.person')
        .to.be.a('string');
    });
  });
});
