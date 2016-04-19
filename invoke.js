const assert = require('assert');
const index = require('./index');
const articles = require('./test/fixtures/articles.json');

const event = {
  Records: [
    {
      Sns: {
        Message: {
          id: 'random-bucket-id',
          query: {
            tiles: articles
          }
        }
      }
    }
  ]
};
const context = {
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1',
  fail: function (data) {
    console.error(data);
  },
  succeed: function (data) {
    assert.equal(data, 'Inserted 2 tiles');
  }
};
index.handler(event, context);
