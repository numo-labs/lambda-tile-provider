require('env2')('.env');
const expect = require('chai').expect;
const awsLambdaHelper = require('aws-lambda-helper');
const sinon = require('sinon');
const handler = require('../lib/saveHandler');

const tiles = [
  {
    id: 'tile:article.dk.1',
    name: 'A random article',
    url: 'http://www.thomascook.com',
    sections: []
  },
  {
    id: 'tile:destination.dk.2',
    name: 'A random destination',
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
  it('save: should call saveRecordToS3  & pushToSNSTopic from aws-lambda-helper', done => {
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
    }, {
      id: 'tile:destination.dk.2',
      type: 'tile',
      url: '456/tile:destination.dk.2',
      tile: {
        id: 'tile:destination.dk.2',
        type: 'destination',
        name: 'A random destination',
        sections: [],
        url: 'http://www.thomascook.com'
      }
    }];

    const expectedSnsFormatItems = [{
      id: 'tile:article.dk.1',
      type: 'tile',
      url: '456/tile:article.dk.1',
      tile: {
        id: 'tile:article.dk.1',
        type: 'article',
        name: 'A random article',
        sections: []
      }
    }, {
      id: 'tile:destination.dk.2',
      type: 'tile',
      url: '456/tile:destination.dk.2',
      tile: {
        id: 'tile:destination.dk.2',
        type: 'destination',
        name: 'A random destination',
        sections: [],
        url: 'http://www.thomascook.com'
      }
    }];

    const saveRecordToS3Spy = sandbox.spy(awsLambdaHelper, 'saveRecordToS3');
    const pushToSNSTopicSpy = sandbox.spy(awsLambdaHelper, 'pushToSNSTopic');

    handler.save('123', '456', '789', tiles, function (err, result) {
      if (err) return console.error(err);
      expect(saveRecordToS3Spy.calledOnce).to.be.true;
      expect(saveRecordToS3Spy.firstCall.args[0].items).to.deep.equal(expectedS3FormatItems);
      expect(pushToSNSTopicSpy.calledOnce).to.be.true;
      expect(pushToSNSTopicSpy.firstCall.args[0].items).to.deep.equal(expectedSnsFormatItems);
      done();
    });
  });
  it('save: should throw an error when saveRecordToS3 throw an error', done => {
    sandbox.stub(awsLambdaHelper, 'saveRecordToS3').yields('Oops, something went wrong');
    handler.save('123', '456', '789', tiles, function (err) {
      expect(err).to.equal('Oops, something went wrong');
      done();
    });
  });
  it('save: should throw an error when pushToSNSTopic throw an error', done => {
    sandbox.stub(awsLambdaHelper, 'pushToSNSTopic').yields('Oops, something went wrong');
    handler.save('123', '456', '789', tiles, function (err) {
      expect(err).to.equal('Oops, something went wrong');
      done();
    });
  });
});
