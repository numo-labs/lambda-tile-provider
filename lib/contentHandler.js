const async = require('async');
const store = require('taggable-searcher').store;
const aws = require('aws-lambda-helper');
const saveHandler = require('./saveHandler');

// Initialise the s3 store
store.init(null, process.env.AWS_ENV || require('aws-lambda-helper').version);

/**
 * Retrieves the content for the tileIds we pass through.
 *
 * @param tileIds The tile ids we want to retrieve content for.
 * @param callback The function to be called when everything is finished.
 */
function get (tileIds, context, callback) {
  async.parallelLimit(generateFunctions(tileIds, context), 10, function (_, results) {
    // Note that contentHandler will never throw an error.
    return callback(null, results.filter(r => r));
  });
}

/**
 * Maps the content into the data structure we want it to be.
 *
 * @param result The content we want to format.
 */
function parseContent (result) {
  const doc = JSON.parse(result);
  return {
    id: doc._id,
    name: doc.displayName,
    location: doc.location,
    url: doc.content[0].url,
    sections: doc.content[0].sections || []
  };
}

/**
 * Generates functions for each tileId so we can pass them in
 * to async.parallel.
 *
 * @param bucketId The bucket id where the file needs to be stored
 * @param tiles The list of tiles to be converted to functions.
 */
function generateFunctions (tileIds, context) {
  return tileIds.map(id => (next) => {
    store.get(id, (err, result) => {
      if (err) {
        aws.log.error(err, `no content found for ${id} in s3`);
        return next();
      }
      const content = parseContent(result);
      saveHandler.save(context.connectionId, context.searchId, context.userId, content, (_, result) => {
        // ignore failed messages
        next(null, content);
      });
    });
  });
}

module.exports.get = get;

