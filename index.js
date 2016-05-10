const awsHelper = require('aws-lambda-helper');
const content_handler = require('./lib/content_handler');
const dynamo_insert = require('./lib/dynamo_insert');

exports.handler = function (event, context, callback) {
  awsHelper.init(context);
  console.log('Received event:', JSON.stringify(event, null, 2)); // debug SNS
  const message = JSON.parse(event.Records[0].Sns.Message);
  const bucket_id = message.id;
  const tiles = message.data.content.tiles;
  if (tiles && tiles.length > 0) {
    content_handler.get(tiles, function (err, data) {
      if (err) return callback(err);
      dynamo_insert(bucket_id, data, function (err, data) {
        if (err) return callback(err);
        return callback(null, 'Inserted ' + tiles.length + ' tiles');
      });
    });
  } else {
    return callback(null, 'No tiles found to be inserted.');
  }
};
