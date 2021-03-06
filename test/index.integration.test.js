const expect = require('chai').expect;
const sinon = require('sinon');
const index = require('../index');
const saveHandler = require('../lib/saveHandler');

const context = {
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
};

var sandbox;

describe('Index (integration)', done => {
  beforeEach(done => {
    sandbox = sinon.sandbox.create();
    done();
  });
  afterEach(done => {
    sandbox.restore();
    done();
  });
  it('Should store store and inform me how many were inserted', done => {
    const message = {
      context: {
        userId: 'UniqueFingerprint',
        connectionId: 'WebsocketGeneratedId',
        searchId: 'injected_by_tests'
      },
      content: {
        tiles: ['tile:article.dk.65', 'tile:article.dk.100', 'tile:article.dk.13', 'tile:destination.dk.108027']
      }
    };

    const event = {
      Records: [
        {
          Sns: {
            Message: JSON.stringify(message)
          }
        }
      ]
    };

    index.handler(event, context, function (err, data) {
      if (err) return done(err);
      expect(data).to.equal('Processed 4 tiles');
      done();
    });
  });
  it('Should only have stored 2 items when 1 of the 3 articles has no content', done => {
    const message = {
      context: {
        userId: 'UniqueFingerprint',
        connectionId: 'WebsocketGeneratedId',
        searchId: 'injected_by_tests'
      },
      content: {
        tiles: ['tile:article.dk.65', 'tile:article.dk.100', 'tile:article.dk.totallyMadeUp']
      }
    };

    const event = {
      Records: [
        {
          Sns: {
            Message: JSON.stringify(message)
          }
        }
      ]
    };

    index.handler(event, context, function (err, data) {
      if (err) return done(err);
      expect(data).to.equal('Processed 2 tiles');
      done();
    });
  });
  it('Should tell us when there are no filed found', done => {
    const message = {
      context: {
        searchId: 'injected_by_tests'
      },
      content: {
        tiles: []
      }
    };

    const event = {
      Records: [
        {
          Sns: {
            Message: JSON.stringify(message)
          }
        }
      ]
    };

    index.handler(event, context, function (err, data) {
      if (err) return done(err);
      expect(data).to.equal('No tiles found to be inserted.');
      done();
    });
  });
  it('should not throw an error when the saveHandler throws an error', done => {
    const message = {
      context: {
        userId: 'UniqueFingerprint',
        connectionId: 'WebsocketGeneratedId',
        searchId: 'injected_by_tests'
      },
      content: {
        tiles: ['tile:article.dk.65', 'tile:article.dk.100', 'tile:article.dk.totallyMadeUp']
      }
    };

    const event = {
      Records: [
        {
          Sns: {
            Message: JSON.stringify(message)
          }
        }
      ]
    };

    sandbox.stub(saveHandler, 'save').yields('Oooops');

    index.handler(event, context, function (err) {
      expect(err).not.to.be.ok;
      done();
    });
  });
});
