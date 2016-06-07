const awsLambdaHelper = require('aws-lambda-helper');
const articleFormatter = require('./articleFormatter');
const destinationFormatter = require('./destinationFormatter');
const formatter = {
  article: articleFormatter,
  destination: destinationFormatter
};

/**
 * Saves all the tiles into s3.
 *
 * @param bucketId The bucket id where the files need to be stored.
 * @param tiles The list of tiles we want to store in s3.
 * @param callback The function to be called when everything is finished.
 */
function save (sessionId, searchId, userId, tiles, callback) {
  const s3Params = {
    id: sessionId,
    searchId: searchId,
    userId: userId,
    items: formatItemsForS3(tiles, searchId)
  };

  // Store the tiles in s3.
  awsLambdaHelper.saveRecordToS3(s3Params, (err, data) => {
    if (err) return callback(err);

    // Push tiles to sns.
    const snsParams = {
      id: sessionId,
      searchId: searchId,
      userId: userId,
      items: formatItemsForSns(tiles, searchId)
    };
    awsLambdaHelper.pushToSNSTopic(snsParams, (err, data) => {
      if (err) return callback(err);
      return callback(null, data);
    });
  });
}

/**
 * Formats the items into the required format to send to Sns.
 *
 * @param items The items that need formatting.
 */
function formatItemsForSns (items, searchId) {
  return items.map(item => {
    const matches = item.id.match(/(\w+):(\w+)\.\w+/);
    return {
      id: item.id,
      type: matches[1],
      url: searchId + '/' + item.id,
      tile: formatter[matches[2]].sns(item)
    };
  });
}

/**
 * Formats the items into the required format to store in s3.
 *
 * @param items The items that need formatting.
 */
function formatItemsForS3 (items, searchId) {
  return items.map(item => {
    const matches = item.id.match(/(\w+):(\w+)\.\w+/);
    return {
      id: item.id,
      type: matches[1],
      url: searchId + '/' + item.id,
      tile: formatter[matches[2]].s3(item)
    };
  });
}

module.exports.save = save;
