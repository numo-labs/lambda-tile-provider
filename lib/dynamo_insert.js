const awsHelper = require('aws-lambda-helper');
const async = require('async');
const config = require('../config.json');
const generator = id_generator();

function insert (key, value, callback) {
  var item = {
    Item: {
      key: { S: key },
      sortKey: { S: generator.next().value.toString() },
      value: { S: value }
    },
    TableName: config.dynamodb.table
  };

  awsHelper.DynamoDB.putItem(item, function (err, data) {
    if (err) return callback(err);
    console.log('Tile inserted:', key, JSON.stringify(item));
    return callback(null, data);
  });
}

function * id_generator (initial_int) {
  var index = initial_int || Date.now();
  while (true) yield index++;
}

module.exports = function batch_insert (id, items, callback) {
  const key = id + '.tile';
  async.waterfall(items.map(function (item) {
    return function (next) {
      insert(key, JSON.stringify(item), function (err, data) {
        if (err) next(err);
        else next();
      });
    };
  }), function (err) {
    if (err) return callback(err);
    else return callback(null);
  });
};

module.exports.__insert = insert; // Only for testing.
module.exports.__id_generator = id_generator; // Only for testing.
