'use strict';

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
function save (sessionId, searchId, userId, tile, callback) {
  const params = {
    id: sessionId,
    searchId: searchId,
    userId: userId,
    items: [formatItemForS3(tile, searchId)]
  };

  awsLambdaHelper.pushResultToClient(params, function (err, data) {
    if (err) {
      awsLambdaHelper.log.error(err, 'Error when pushing to client');
    }
    awsLambdaHelper.log.trace({ toClient: data }, 'Pushing to client');
    return callback(err, data);
  });
}

/**
 * Formats the item into the required format to store in s3.
 *
 * @param item The item that needs formatting.
 */
function formatItemForS3 (item, searchId) {
  const matches = item.id.match(/(\w+):(\w+)\.\w+/);
  return {
    id: item.id,
    type: matches[1],
    url: searchId + '/' + item.id,
    tile: formatter[matches[2]].s3(item)
  };
}

module.exports.save = save;
