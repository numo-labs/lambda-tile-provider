require('env2')('.env');
const assert = require('assert');
const awsLambdaHelper = require('aws-lambda-helper');
const sinon = require('sinon');
const handler = require('../lib/saveHandler');

const articles = [
  {
    id: 'tile:article.dk.1',
    name: 'A random article',
    url: 'http://www.thomascook.com',
    sections: []
  },
  {
    id: 'tile:article.dk.2',
    name: 'A random article',
    url: 'http://www.thomascook.com',
    sections: []
  }
];

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
  it.only('save: should call pushResultToClient from aws-lambda-helper', done => {
    const expectedItems = [{
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
    }, {
      id: 'tile:article.dk.2',
      type: 'tile',
      url: '456/tile:article.dk.2',
      tile: {
        id: 'tile:article.dk.2',
        type: 'article',
        name: 'A random article',
        sections: [],
        url: 'http://www.thomascook.com'
      }
    }];

    const spy = sandbox.spy(awsLambdaHelper, 'pushResultToClient');

    handler.save('123', '456', '789', articles, function (err, result) {
      if (err) return console.error(err);
      assert(spy.calledOnce);
      assert.deepEqual(spy.firstCall.args[0].items, expectedItems);
      done();
    });
  });
  it('save: should throw an error when pushResultToClient throw an error', done => {
    sandbox.stub(awsLambdaHelper, 'pushResultToClient').yields('Oops, something went wrong');
    handler.save('123', '456', '789', articles, function (err) {
      assert.equal(err, 'Oops, something went wrong');
      done();
    });
  });
});
