const assert = require('assert');
const index = require('./index');
const articles = require('./test/fixtures/articles.json');
const article_1 = articles[0];
const article_2 = articles[1];

const message = {
  id: 'random-bucket-id',
  data: {
    content: {
      tiles: [
        {
          id: article_1.id,
          type: 'article',
          content: article_1
        },
        {
          id: article_2.id,
          type: 'article',
          content: article_2
        }
      ]
    }
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
