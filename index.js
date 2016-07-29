require('env2')('.env');
const aws = require('aws-lambda-helper');
const contentHandler = require('./lib/contentHandler');

exports.handler = function (event, context, callback) {
  aws.init(context, event);
  aws.log.info({ event: event }, 'Incoming event');

  const message = JSON.parse(event.Records[0].Sns.Message);
  const tiles = message.content.tiles;
  if (tiles && tiles.length) {
    // Fetch the content for the tile ids.
    contentHandler.get(tiles, message.context, (_, data) => {
      // Note that contentHandler will never throw an error.
      aws.log.trace({ message: message, tiles: data.length, expected: tiles.length }, 'Handle Save');
      return callback(null, `Processed ${data.length} tiles`);
    });
  } else {
    aws.log.info({ message: message }, 'No tiles found to be inserted');
    return callback(null, 'No tiles found to be inserted.');
  }
};
