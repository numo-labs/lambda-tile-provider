require('env2')('.env');
const parallel = require('async').parallel;
const awsHelper = require('aws-lambda-helper');
const contentHandler = require('./lib/contentHandler');
const saveHandler = require('./lib/saveHandler');
const dynamoHandler = require('./lib/dynamoHandler');

exports.handler = function (event, context, callback) {
  awsHelper.init(context, event);
  awsHelper.log.info({ event: event }, 'Incoming event');

  const message = JSON.parse(event.Records[0].Sns.Message);
  const tiles = message.data.content.tiles;
  if (tiles && tiles.length) {
    contentHandler.get(tiles, (err, data) => {
      if (err) return callback(err);
      /**
       * FIXME: For now we will store into dynamodb and push the data to S3 and
       * the websocket server. If S3 + websockets are fully implemented we can
       * remove the dynamodbHandler from this code.
       */
      parallel([
        (next) => saveHandler.save(message.id, tiles, next),
        (next) => dynamoHandler.insertAll(message.id, tiles, next)
      ], (err) => {
        if (err) return callback(err);
        return callback(null, `Process ${tiles.length} tiles`);
      });
    });
  } else {
    return callback(null, 'No tiles found to be inserted.');
  }
};
