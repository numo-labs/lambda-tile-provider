const aws = require('aws-lambda-helper');
/**
 * Generates functions for each tileId so we can pass them in
 * to async.parallel.
 *
 * @param bucketId The bucket id where the file needs to be stored
 * @param tiles The list of tiles to be converted to functions.
 */
function sendCompleteEvent (context, callback) {
  const params = {
    id: context.connectionId,
    searchId: context.searchId,
    userId: context.userId,
    items: [],
    searchComplete: true
  };

  aws.pushResultToClient(params, (err) => {
    if (err) {
      aws.log.error({ error: err }, 'Error sending complete event');
    }
    callback();
  });
}

module.exports = sendCompleteEvent;
