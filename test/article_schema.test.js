const assert = require('assert');
const tv4 = require('tv4');
const schema = require('../schema/article.json');
const articles_fixture = require('./fixtures/articles.json');
const corrupt_articles_fixture = require('./fixtures/corrupt_articles.json');

describe('Artice schema', function () {
  it('should succeed when the incoming articles are valid', function (done) {
    const result = tv4.validateResult(articles_fixture, schema);
    assert(result.valid);
    done();
  });
  it('should fail when the incoming data is invalid', function (done) {
    const result = tv4.validateResult(corrupt_articles_fixture, schema);
    assert.equal(result.error.message, 'Missing required property: text');
    done();
  });
});
