const awsLambdaHelper = require('aws-lambda-helper');

/**
 * Saves all the tiles into s3.
 *
 * @param bucketId The bucket id where the files need to be stored.
 * @param tiles The list of tiles we want to store in s3.
 * @param callback The function to be called when everything is finished.
 */
function save (sessionId, searchId, userId, tiles, callback) {
  const params = {
    id: sessionId,
    searchId: searchId,
    userId: userId,
    items: formatItems(tiles)
  };

  awsLambdaHelper.pushResultToClient(params, function (err, result) {
    if (err) return callback(err);
    return callback(null, result);
  });
}

/**
 * Formats the items into the required format.
 *
 * @param items The items that need formatting.
 */
function formatItems (items) {
  return items.map(item => {
    const matches = item.id.match(/(\w+):(\w+)\.\w+/);
    return {
      id: item.id,
      type: matches[1],
      tile: {
        id: item.id,
        type: matches[2],
        name: item.name,
        sections: item.sections,
        url: item.url
      }
    };
  });
}

module.exports.save = save;
