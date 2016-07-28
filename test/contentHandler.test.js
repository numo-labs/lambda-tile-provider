require('env2')('.env');
const expect = require('chai').expect;
const sinon = require('sinon');
const handler = require('../lib/contentHandler');
const saveHandler = require('../lib/saveHandler');

// Initialising for logging.
const awsLambdaHelper = require('aws-lambda-helper');
awsLambdaHelper.init({
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
});

var sandbox;

describe('contentHandler', () => {
  const context = {
    connectionId: 'connectionId',
    searchId: 'searchId',
    userId: 'userId'
  };
  beforeEach(done => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(awsLambdaHelper, 'pushResultToClient').yields(null, {});
    done();
  });
  afterEach(done => {
    sandbox.restore();
    done();
  });
  it('get: should return the content for the given ids', done => {
    const tileIds = ['tile:article.dk.10', 'tile:article.dk.100'];
    handler.get(tileIds, context, (err, results) => {
      expect(err).not.to.be.ok;
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
  it('get: should call save handler for each result', done => {
    const tileIds = ['tile:article.dk.10', 'tile:article.dk.100'];
    sandbox.stub(saveHandler, 'save').yields(null, {});
    handler.get(tileIds, context, (err, results) => {
      expect(err).not.to.be.ok;
      expect(saveHandler.save.callCount).to.equal(2);
      // we don't know what order exactly the tiles will be sent in
      // so just assert that the save function has been called with the right args
      expect(saveHandler.save.calledWith('connectionId', 'searchId', 'userId', sinon.match({ id: tileIds[0] })));
      expect(saveHandler.save.calledWith('connectionId', 'searchId', 'userId', sinon.match({ id: tileIds[1] })));
      done();
    });
  });
  it('get: should log an error when an article was not found but still return the found id content', done => {
    // I spy, I spy with my little eye...
    const spy = sandbox.spy(awsLambdaHelper.log, 'error');
    const tileIds = ['tile:article.dk.10', 'tile:article.dk.doesnotexist'];
    handler.get(tileIds, context, (err, results) => {
      expect(err).not.to.be.ok;
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
