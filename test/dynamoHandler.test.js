require('env2')('.env');
const assert = require('assert');
const sinon = require('sinon');
const handler = require('../lib/dynamoHandler');

const awsLambdaHelper = require('aws-lambda-helper');
awsLambdaHelper.init({
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
});

describe('dynamoHandler', () => {
  afterEach(done => {
    sinon.restore();
    done();
  });
  it('insertAll: should insert all given items into dynamodb', done => {
    const spy = sinon.spy(awsLambdaHelper.DynamoDB, 'putItem');
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
  it.skip('should throw an error when an insert failed, but should continue to insert the rest', done => {
    // const spy = sinon.spy(awsLambdaHelper.DynamoDB, 'putItem');
    const corruptArticles = require('./fixtures/articles.json');

    // Initialise the id generator.
    handler.initialiseIdGenerator(1);

    handler.insertAll('injected_by_tests', corruptArticles, (err, results) => {
      if (err) return console.log(err);

      console.log(results);

      done();
    });
  });
});
