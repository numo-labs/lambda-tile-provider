const expect = require('chai').expect;
const formatter = require('../lib/destinationFormatter');

const item = {
  id: '42',
  name: 'Pink Fluffy Unicorns',
  sections: [
    {
      title: 'Dancing Unicorns',
      image: 'insert_cute_unicorn_image_here',
      text: 'Pink fluffy unicorns dancing on rainbows.'
    }
  ],
  url: 'www.pinkfluffyunicorns.org'
};

const expectedResult = {
  id: '42',
  name: 'Pink Fluffy Unicorns',
  type: 'destination',
  sections: [
    {
      title: 'Dancing Unicorns',
      image: 'insert_cute_unicorn_image_here',
      text: 'Pink fluffy unicorns dancing on rainbows.'
    }
  ],
  url: 'www.pinkfluffyunicorns.org'
};

describe('destinationFormatter', () => {
  it('s3: should return the article format for s3', (done) => {
    const result = formatter.s3(item);
    expect(result).to.deep.equal(expectedResult);
    done();
  });
  it('sns: should return the article format for sns', (done) => {
    const result = formatter.sns(item);
    expect(result).to.deep.equal(expectedResult);
    done();
  });
});
