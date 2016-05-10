require('env2')('.env');
const awsHelper = require('aws-lambda-helper');
const async = require('async');
const generator = id_generator();

function insert (key, value, callback) {
  console.log(value);
  var item = {
    Item: {
      key: {S: key},
      sortKey: {S: generator.next().value.toString()},
      value: {S: value}
    },
    TableName: process.env.DYNAMO_DB_TABLE
  };

  awsHelper.DynamoDB.putItem(item, function (err, data) {
    if (err) return callback(err);
    console.log('Tile inserted:', key, JSON.stringify(item));
    return callback(null, item.Item.sortKey.S);
  });
}

function * id_generator (initial_int) {
  var index = initial_int || Date.now();
  while (true) yield index++;
}

module.exports = function batch_insert (id, items, callback) {
  const key = id + '.tile';
  async.waterfall(items.map(function (item, index) {
    if (index === 0) {
      return function (next) {
        insert(key, JSON.stringify(item), function (err, sort_key) {
          if (err) next(err);
          else next(null, [sort_key]);
        });
      };
    } else {
      return function (sort_keys, next) {
        insert(key, JSON.stringify(item), function (err, sort_key) {
          if (err) next(err);
          else {
            sort_keys.push(sort_key);
            next(null, sort_keys);
          }
        });
      };
    }
  }), function (err, sort_keys) {
    if (err) return callback(err);
    else {
      // finalize the input with an index file.
      insert(id + '.tiles', sort_keys.join(','), function (err, sort_key) {
        if (err) return callback(err);
        else return callback(null);
      });
    }
  });
};

module.exports.__insert = insert; // Only for testing.
module.exports.__id_generator = id_generator; // Only for testing.
