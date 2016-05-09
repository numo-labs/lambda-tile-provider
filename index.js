const awsHelper = require('aws-lambda-helper');
const content_handler = require('./lib/content_handler');
const dynamo_insert = require('./lib/dynamo_insert');

exports.handler = function (event, context) {
  awsHelper.init(context);
  const log = awsHelper.Logger('example');
  log.info('Received event:', JSON.stringify(event, null, 2)); // debug SNS
  const message = JSON.parse(event.Records[0].Sns.Message);
  const bucket_id = message.id;
  const tiles = message.data.content.tiles;
  if (tiles) {
    content_handler.get(tiles, function (err, data) {
      if (err) context.fail(err);
      dynamo_insert(bucket_id, tiles, function (err, data) {
        if (err) return context.fail(err);
        return context.succeed('Inserted ' + tiles.length + ' tiles');
      });
    });
  } else {
    return context.succeed('No tiles found to be inserted.');
  }
};
