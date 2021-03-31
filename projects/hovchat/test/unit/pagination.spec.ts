import { expect } from 'chai';
import paginate from 'src/library/pagination';
import chance from 'test/helpers/chance';

describe('Pagination', () => {
  describe('Paginate function', () => {
    it('should return hasNextPage to true and total count of 2 given data length is greater than limit', function () {
      const now = new Date();
      const data = [
        {
          body: chance.sentence(),
          cursorDateTimeCreated: now.getTime().toString(36),
        },
        {
          body: chance.sentence(),
          cursorDateTimeCreated: now.getTime().toString(36),
        },
        {
          body: chance.sentence(),
          cursorDateTimeCreated: now.getTime().toString(36),
        },
      ];

      const result = paginate(data.length - 1, data);

      expect(result).to.be.have.property('totalCount', data.length - 1);
      expect(result).to.be.have.nested.property('pageInfo.hasNextPage', true);
      expect(result).to.be.have.property('edges').and.to.be.an('array');
    });

    it('should return all data and hasNextPage is equal to false', function () {
      const now = new Date();
      const data = [
        {
          body: chance.sentence(),
          cursorDateTimeCreated: now.getTime().toString(36),
        },
        {
          body: chance.sentence(),
          cursorDateTimeCreated: now.getTime().toString(36),
        },
      ];

      const result = paginate(null, data);

      expect(result).to.be.have.property('totalCount', data.length);
      expect(result).to.be.have.nested.property('pageInfo.hasNextPage', false);
      expect(result).to.be.have.property('edges').and.to.be.an('array');
    });
  });
});
