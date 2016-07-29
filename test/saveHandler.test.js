require('env2')('.env');
const expect = require('chai').expect;
const awsLambdaHelper = require('aws-lambda-helper');
const sinon = require('sinon');
const handler = require('../lib/saveHandler');

const tile = {
  id: 'tile:article.dk.1',
  name: 'A random article',
  url: 'http://www.thomascook.com',
  sections: []
};

var sandbox;

describe('saveHandler', done => {
  beforeEach(done => {
    sandbox = sinon.sandbox.create();
    done();
  });
  afterEach(done => {
    sandbox.restore();
    done();
  });
  it('save: should call pushResultToClient aws-lambda-helper', done => {
    const expectedS3FormatItems = [{
      id: 'tile:article.dk.1',
      type: 'tile',
      url: '456/tile:article.dk.1',
      tile: {
        id: 'tile:article.dk.1',
        type: 'article',
        name: 'A random article',
        sections: [],
        url: 'http://www.thomascook.com'
      }
    }];

    const pushResultToClientSpy = sandbox.stub(awsLambdaHelper, 'pushResultToClient').yields();

    handler.save('123', '456', '789', tile, function (err, result) {
      if (err) return console.error(err);
      expect(pushResultToClientSpy.called).to.be.true;
      expect(pushResultToClientSpy.firstCall.args[0].items).to.deep.equal(expectedS3FormatItems);
      done();
    });
  });
  it('save: should throw an error when pushResultToClient throw an error', done => {
    sandbox.stub(awsLambdaHelper, 'pushResultToClient').yields(new Error('Oops, something went wrong'));
    handler.save('123', '456', '789', tile, function (err) {
      expect(err.message).to.equal('Oops, something went wrong');
      done();
    });
  });
});
