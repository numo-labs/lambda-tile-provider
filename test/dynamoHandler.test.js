require('env2')('.env');
const assert = require('assert');
const sinon = require('sinon');
const handler = require('../lib/dynamoHandler');

const awsLambdaHelper = require('aws-lambda-helper');
awsLambdaHelper.init({
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
});

var sandbox;

describe('dynamoHandler', () => {
  beforeEach(done => {
    sandbox = sinon.sandbox.create();
    done();
  });
  afterEach(done => {
    sandbox.restore();
    done();
  });
  it('should generate a unique id for each item', done => {
    const spy = sandbox.spy(awsLambdaHelper.DynamoDB, 'putItem');
    const articles = require('./fixtures/articles.json');

    handler.insertAll('injected_by_tests', articles, function (err, data) {
      if (err) return done(err);
      assert(spy.calledThrice);

      const firstSortKey = spy.firstCall.args[0].Item.sortKey.S;
      const secondSortKey = spy.secondCall.args[0].Item.sortKey.S;
      assert.equal(secondSortKey, (Number.parseInt(firstSortKey) + 1));
      done();
    });
  });
  it('insertAll: should insert all given items into dynamodb', done => {
    const spy = sandbox.spy(awsLambdaHelper.DynamoDB, 'putItem');
    const articles = require('./fixtures/articles.json');

    // Initialise the id generator.
    handler.initialiseIdGenerator(1);

    handler.insertAll('injected_by_tests', articles, (err, result) => {
      if (err) return console.error(err);

      // 2 item inserts and 1 index insert.
      assert(spy.calledThrice);

      // Check the first article call
      assert.deepEqual(spy.firstCall.args[0], {
        Item: {
          key: {S: 'injected_by_tests.tile'},
          sortKey: {S: '1'},
          value: {S: JSON.stringify(articles[0])}
        },
        TableName: process.env.DYNAMO_DB_TABLE
      });

      // Check the second article call
      assert.deepEqual(spy.secondCall.args[0], {
        Item: {
          key: {S: 'injected_by_tests.tile'},
          sortKey: {S: '2'},
          value: {S: JSON.stringify(articles[1])}
        },
        TableName: process.env.DYNAMO_DB_TABLE
      });

      // The third call is the index insert call.
      // Check the second article call
      assert.deepEqual(spy.thirdCall.args[0], {
        Item: {
          key: {S: 'injected_by_tests.tiles'},
          sortKey: {S: '3'},
          value: {S: '1,2'}
        },
        TableName: process.env.DYNAMO_DB_TABLE
      });

      assert.deepEqual(result, ['1', '2']);
      done();
    });
  });
  it('should throw an error when an insert failed, but should continue to insert the rest', done => {
    const articles = require('./fixtures/articles.json');
    const spy = sandbox.spy(awsLambdaHelper.log, 'error');
    const item = {
      Item: {
        key: {S: 'injected_by_tests.tile'},
        sortKey: {S: '2'},
        value: {S: JSON.stringify(articles[1])}
      }
    };

    const index = {
      Item: {
        key: {S: 'injected_by_tests.tiles'},
        sortKey: {S: '3'},
        value: {S: '1,2'}
      }
    };

    handler.initialiseIdGenerator(1);

    // Only callback with an error for the first article.
    sandbox.stub(awsLambdaHelper.DynamoDB, 'putItem')
      .onFirstCall().yields('ERROR ERROR')
      .onSecondCall().yields(null, item)
      .onThirdCall().yields(null, index);

    handler.insertAll('injected_by_tests', articles, (err, results) => {
      if (err) return done(err);

      // Verify that the logger was called with the correct error message.
      assert(spy.calledOnce);
      assert.equal(spy.firstCall.args[1], 'Failed to store item');

      // Verify we get a result even if one of the 2 articles failed
      assert.equal(results, 2);

      done();
    });
  });
});
