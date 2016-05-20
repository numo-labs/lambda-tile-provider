const waterfall = require('async').waterfall;
const aws = require('aws-lambda-helper');
const dynamodb = require('aws-lambda-helper').DynamoDB;
var generator;

/**
 * Inserts all the items into dynamodb.
 *
 * @param id The id used to build up the key.
 * @param items The items that need to be stored.
 * @param callback The function to be called when everything is finished.
 */
function insertAll (id, items, callback) {
  // Init generator
  if (!generator) generator = idGenerator();

  waterfall(generateInsertItemFunctions(items, `${id}.tile`), function (err, sortKeys) {
    if (err) return callback(err);
    // Finalize the input with an index file.
    const filteredSortKeys = sortKeys.filter(key => { if (key) return key; });
    insert(`${id}.tiles`, filteredSortKeys.join(','), function (err, indexSortKey) {
      if (err) return callback(err);
      aws.log.debug(filteredSortKeys, `Stored ${filteredSortKeys.length} tiles to dynamodb ${id}`);
      return callback(null, filteredSortKeys);
    });
  });
}

/**
 * Inserts an item into dynamodb.
 *
 * @param key The key used to store the item in dynamodb.
 * @param value The value to be stored.
 * @param callback The function to be called when everything is finished.
 */
function insert (key, value, callback) {
  const item = {
    Item: {
      key: {S: key},
      sortKey: {S: generator.next().value.toString()},
      value: {S: value}
    },
    TableName: process.env.DYNAMO_DB_TABLE
  };

  // Store the item in dynamodb.
  dynamodb.putItem(item, function (err) {
    if (err) {
      aws.log.error(err, 'Failed to store item');
      return callback();
    } else {
      aws.log.debug({itemKey: item.Item.key.S, item: item.Item.value.S}, 'Storing item');
      return callback(null, item.Item.sortKey.S);
    }
  });
}

/**
 * Generates a unique id when requested.
 *
 * @param initial The initial (int/long) value. Defaults to the current time in milliseconds.
 */
function * idGenerator (initial) {
  var index = initial || Date.now();
  while (true) yield index++;
}

/**
 * Initialises the id generator. This is mainly for testing purposes.
 */
function initialiseIdGenerator (initial) {
  generator = idGenerator(initial);
}

/**
 * Generates all the functions needed for async.waterfall.
 * @param items The items that need to be mapped to functions.
 * @param key The key used to store the item in dynamodb.
 */
function generateInsertItemFunctions (items, key) {
  return items.map((item, index) => {
    if (index) {
      return (sortKeys, next) => {
        insert(key, JSON.stringify(item), function (err, sortKey) {
          if (err) return next(err);
          // Keeping things immutable.
          const sortKeysCopy = sortKeys.slice();
          sortKeysCopy.push(sortKey);
          next(null, sortKeysCopy);
        });
      };
    } else {
      // This is the first waterfall function.
      return (next) => {
        insert(key, JSON.stringify(item), function (err, sortKey) {
          if (err) return next(err);
          return next(null, [sortKey]);
        });
      };
    }
  });
}

module.exports.insertAll = insertAll;
module.exports.initialiseIdGenerator = initialiseIdGenerator;
