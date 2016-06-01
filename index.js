require('env2')('.env');
const parallel = require('async').parallel;
const aws = require('aws-lambda-helper');
const contentHandler = require('./lib/contentHandler');
const saveHandler = require('./lib/saveHandler');
const dynamoHandler = require('./lib/dynamoHandler');

exports.handler = function (event, context, callback) {
  aws.init(context, event);
  aws.log.info({ event: event }, 'Incoming event');

  const message = JSON.parse(event.Records[0].Sns.Message);
  const tiles = message.content.tiles;
  if (tiles && tiles.length) {
    // Fetch the content for the tile ids.
    contentHandler.get(tiles, (_, data) => {
      // Note that contentHandler will never throw an error.
      /**
       * FIXME: For now we will store into dynamodb and push the data to S3 and
       * the websocket server. If S3 + websockets are fully implemented we can
       * remove the dynamodbHandler from this code.
       */
      parallel([
        (next) => saveHandler.save(message.context.connectionId, message.context.searchId, message.context.userId, data, next),
        (next) => dynamoHandler.insertAll(message.context.searchId, data, next)
      ], (err) => {
        if (err) return callback(err);
        return callback(null, `Processed ${data.length} tiles`);
      });
    });
  } else {
    return callback(null, 'No tiles found to be inserted.');
  }
};
