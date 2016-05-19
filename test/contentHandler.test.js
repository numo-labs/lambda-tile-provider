require('env2')('.env');
const assert = require('assert');
const sinon = require('sinon');
const handler = require('../lib/contentHandler');

// Initialising for logging.
const awsLambdaHelper = require('aws-lambda-helper');
awsLambdaHelper.init({
  invokedFunctionArn: 'in:a:galaxy:far:far:away:starwarsbaby'
});

describe('contentHandler', () => {
  it('get: should return the content for the given ids', done => {
    const tileIds = ['tile:article.dk.10', 'tile:article.dk.100'];
    handler.get(tileIds, (err, results) => {
      if (err) return console.error(err);
      const tile1 = results[0];
      const tile2 = results[1];
      assert.equal(tile1.id, tileIds[0]);
      assert.equal(tile2.id, tileIds[1]);
      assert(tile1.id && tile1.name && tile1.url && tile1.sections);
      assert(tile2.id && tile2.name && tile2.url && tile2.sections);
      done();
    });
  });
  it('get: should log an error wen an article was not found but still return the found id content', done => {
    // I spy, I spy with my little eye...
    const spy = sinon.spy(awsLambdaHelper.log, 'error');
    const tileIds = ['tile:article.dk.10', 'tile:article.dk.doesnotexist'];
    handler.get(tileIds, (err, results) => {
      if (err) return console.error(err);
      // Verify that the found content came back.
      assert.equal(results.length, 1);
      const tile = results[0];
      assert.equal(tile.id, tileIds[0]);
      assert(tile.id && tile.name && tile.url && tile.sections);

      // Verify that the logger was called with the correct error message.
      assert(spy.calledOnce);
      assert.equal(spy.firstCall.args[1], 'no content found for tile:article.dk.doesnotexist in s3');
      done();
    });
  });
});
