const saveRecordToS3 = require('aws-lambda-helper').saveRecordToS3;
const parallel = require('async').parallel;

/**
 * Saves all the tiles into dynamodb.
 *
 * @param bucketId The bucket id where the files need to be stored.
 * @param tiles The list of tiles we want to store in s3.
 * @param callback The function to be called when everything is finished.
 */
function save (bucketId, tiles, callback) {
  parallel(generateFunctions(bucketId, tiles), function (err) {
    if (err) return callback(err);
    callback(null, `Sent ${tiles.length} tiles to s3 bucket ${bucketId}`);
  });
}

/**
 * Generates functions for each tile so we can pass them in
 * to async.parallel.
 *
 * @param bucketId The bucket id where the file needs to be stored
 * @param tiles The list of tiles to be converted to functions.
 */
function generateFunctions (bucketId, tiles) {
  return tiles.map(tile => (next) => saveRecordToS3(bucketId, tile.name, tile, next));
}

module.exports.save = save;
