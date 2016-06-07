const expect = require('chai').expect;
const formatter = require('../lib/articleFormatter');

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

describe('articleFormatter', () => {
  it('s3: should return the article format for s3', (done) => {
    const result = formatter.s3(item);
    const expectedResult = {
      id: '42',
      name: 'Pink Fluffy Unicorns',
      type: 'article',
      sections: [
        {
          title: 'Dancing Unicorns',
          image: 'insert_cute_unicorn_image_here',
          text: 'Pink fluffy unicorns dancing on rainbows.'
        }
      ],
      url: 'www.pinkfluffyunicorns.org'
    };
    expect(result).to.deep.equal(expectedResult);
    done();
  });
  it('sns: should return the article format for sns', (done) => {
    const result = formatter.sns(item);
    const expectedResult = {
      id: '42',
      type: 'article',
      name: 'Pink Fluffy Unicorns',
      sections: [{
        image: 'insert_cute_unicorn_image_here'
      }]
    };
    expect(result).to.deep.equal(expectedResult);
    done();
  });
});
