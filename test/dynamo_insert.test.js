const assert = require('assert');
const simple = require('simple-mock');
const awsHelper = require('aws-lambda-helper');
const dynamo_insert = require('../lib/dynamo_insert');

describe('dynamo_insert', function () {
  const context = {
    invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
  };
  awsHelper.init(context);
  awsHelper.Logger('lambda-tile-provider');

  afterEach(function (done) {
    simple.restore();
    done();
  });
  it('id_generator: should create a new id every time it is called', function (done) {
    const generator = dynamo_insert.__id_generator(1);
    assert.equal(generator.next().value, 1);
    assert.equal(generator.next().value, 2);
    assert.equal(generator.next().value, 3);
    assert.equal(generator.next().value, 4);
    assert.equal(generator.next().value, 5);
    done();
  });
  it('insert: should create the dynamodb item and insert it', function (done) {
    const mock = simple.mock(awsHelper.DynamoDB, 'putItem').callbackWith(null, 'putItem');
    dynamo_insert.__insert('a_key', 'a_value', function (_, data) {
      const item = mock.lastCall.arg;
      assert.equal(item.Item.key.S, 'a_key');
      assert.equal(item.Item.value.S, 'a_value');
      done();
    });
  });
  it('insert: should call back with an error if an error occured in the dynamodb request', function (done) {
    simple.mock(awsHelper.DynamoDB, 'putItem').callbackWith('error');
    dynamo_insert.__insert('a_key', 'a_value', function (err) {
      assert.equal(err, 'error');
      done();
    });
  });
  it('batch_insert: should add all items to dynamodb', function (done) {
    const mock = simple.mock(awsHelper.DynamoDB, 'putItem').callbackWith(null, 'putItem');
    const articles = require('./fixtures/articles.json');
    dynamo_insert('an_id', articles, function (_, data) {
      assert.equal(mock.callCount, 3);
      assert.equal(mock.calls[0].arg.Item.key.S, 'an_id.tile');
      assert.equal(mock.calls[0].arg.Item.value.S, JSON.stringify(articles[0]));
      assert.equal(mock.calls[1].arg.Item.key.S, 'an_id.tile');
      assert.equal(mock.calls[1].arg.Item.value.S, JSON.stringify(articles[1]));
      done();
    });
  });
  it('batch_insert: should call back with an error if an error occured in the dynamodb request', function (done) {
    const mock = simple.mock(awsHelper.DynamoDB, 'putItem').callbackWith('error');
    const articles = require('./fixtures/articles.json');
    dynamo_insert('an_id', articles, function (err) {
      assert.equal(mock.callCount, 1);
      assert.equal(err, 'error');
      done();
    });
  });
});
