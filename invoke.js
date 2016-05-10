const assert = require('assert');
const index = require('./index');

const message = {
  id: 'random-bucket-id',
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
const context = {
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:847002989232:function:lambda-tile-provider-v1'
};

index.handler(event, context, function (err, data) {
  if (err) console.log(err);
  else {

  }
  assert.equal(data, 'Inserted 3 tiles');
});
