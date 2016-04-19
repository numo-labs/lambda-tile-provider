const awsHelper = require('aws-lambda-helper');
const dynamo_insert = require('./lib/dynamo_insert');

exports.handler = function (event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2)); // debug SNS
  const message = event.Records[0].Sns.Message;
  const bucket_id = message.id;
  const tiles = message.content.tiles;
  if (tiles) {
    awsHelper.init(context);
    dynamo_insert(bucket_id, tiles, function (err, data) {
      if (err) return context.fail(err);
      return context.succeed('Inserted ' + tiles.length + ' tiles');
    });
  } else {
    return context.succeed('No tiles found to be inserted.');
  }
};
