require('env2')('.env');
const expect = require('chai').expect;
const sinon = require('sinon');
const handler = require('../lib/contentHandler');

// Initialising for logging.
const awsLambdaHelper = require('aws-lambda-helper');
awsLambdaHelper.init({
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
});

var sandbox;

describe('contentHandler', () => {
  beforeEach(done => {
    sandbox = sinon.sandbox.create();
    done();
  });
  afterEach(done => {
    sandbox.restore();
    done();
  });
  it('get: should return the content for the given ids', done => {
    const tileIds = ['tile:article.dk.10', 'tile:article.dk.100'];
    handler.get(tileIds, (err, results) => {
      if (err) return console.error(err);
      const tile1 = results[0];
      const tile2 = results[1];
      expect(tile1.id).to.equal(tileIds[0]);
      expect(tile2.id).to.equal(tileIds[1]);
      expect(tile1.name).to.exist;
      expect(tile1.url).to.exist;
      expect(tile1.sections).exist;
      expect(tile2.name).to.exist;
      expect(tile2.url).to.exist;
      expect(tile2.sections).exist;
      done();
    });
  });
  it('get: should log an error wen an article was not found but still return the found id content', done => {
    // I spy, I spy with my little eye...
    const spy = sandbox.spy(awsLambdaHelper.log, 'error');
    const tileIds = ['tile:article.dk.10', 'tile:article.dk.doesnotexist'];
    handler.get(tileIds, (err, results) => {
      if (err) return console.error(err);
      // Verify that the found content came back.
      expect(results.length).to.equal(1);
      const tile = results[0];
      expect(tile.id).to.equal(tileIds[0]);
      expect(tile.name).to.exist;
      expect(tile.url).to.exist;
      expect(tile.sections).exist;

      // Verify that the logger was called with the correct error message.
      expect(spy.calledOnce).to.be.true;
      expect(spy.firstCall.args[1]).to.equal('no content found for tile:article.dk.doesnotexist in s3');
      done();
    });
  });
});
