const assert = require('assert');
const index = require('../index');

const context = {
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
};

describe.only('Index (integration)', done => {
  it('Should store store and inform me how many were inserted', done => {
    const message = {
      id: 'injected_by_tests',
      data: {
        content: {
          tiles: ['tile:article.dk.65', 'tile:article.dk.100', 'tile:article.dk.13']
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

    index.handler(event, context, function (err, data) {
      if (err) console.log(err);
      else {
        assert.equal(data, 'Inserted 3 tiles');
      }
    });
  });
  it('Should only have stored 2 items when 1 of the 3 articles has no content', done => {
    const message = {
      id: 'injected_by_tests',
      data: {
        content: {
          tiles: ['tile:article.dk.65', 'tile:article.dk.100', 'tile:article.dk.totallyMadeUp']
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

    index.handler(event, context, function (err, data) {
      if (err) console.log(err);
      else {
        assert.equal(data, 'Inserted 2 tiles');
      }
    });
  });
});
