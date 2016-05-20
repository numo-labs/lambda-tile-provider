const async = require('async');
const store = require('taggable-searcher').store;
const aws = require('aws-lambda-helper');

// Initialise the s3 store
store.init(null, process.env.AWS_ENV || require('aws-lambda-helper').version);

/**
 * Retrieves the content for the tileIds we pass through.
 *
 * @param tileIds The tile ids we want to retrieve content for.
 * @param callback The function to be called when everything is finished.
 */
function get (tileIds, callback) {
  async.parallel(generateFunctions(tileIds), function (err, results) {
    if (err) return callback(err);
    return callback(null, mapContent(results.filter(result => { if (result) return result; })));
  });
}

/**
 * Maps the content results into the data structure we want it to be.
 *
 * @param results The list of content we want to format.
 */
function mapContent (results) {
  return results.map(result => {
    const doc = JSON.parse(result);
    return {
      id: doc._id,
      name: doc.displayName,
      url: doc.content[0].url,
      sections: doc.content[0].sections || []
    };
  });
}

/**
 * Generates functions for each tileId so we can pass them in
 * to async.parallel.
 *
 * @param bucketId The bucket id where the file needs to be stored
 * @param tiles The list of tiles to be converted to functions.
 */
function generateFunctions (tileIds) {
  return tileIds.map(id => (next) => {
    store.get(id, (err, result) => {
      if (err) aws.log.error(err, `no content found for ${id} in s3`);
      next(null, result);
    });
  });
}

module.exports.get = get;
