require('env2')('.env');
const aws = require('aws-lambda-helper');
const contentHandler = require('./lib/contentHandler');
const saveHandler = require('./lib/saveHandler');

exports.handler = function (event, context, callback) {
  aws.init(context, event);
  aws.log.info({ event: event }, 'Incoming event');

  const message = JSON.parse(event.Records[0].Sns.Message);
  const tiles = message.content.tiles;
  if (tiles && tiles.length) {
    // Fetch the content for the tile ids.
    contentHandler.get(tiles, (_, data) => {
      // Note that contentHandler will never throw an error.
      aws.log.trace({ message: message, tiles: data.length, expected: tiles.length }, 'Handle Save');
      saveHandler.save(message.context.connectionId, message.context.searchId, message.context.userId, data, (err, result) => {
        if (err) {
          aws.log.error(err, 'Unable handle save');
          return callback(err);
        }
        aws.log.trace({ results: { expected: result.length, actual: result.length } }, 'Processed tiles');
        return callback(null, `Processed ${data.length} tiles`);
      });
    });
  } else {
    aws.log.info({ message: message }, 'No tiles found to be inserted');
    return callback(null, 'No tiles found to be inserted.');
  }
};
