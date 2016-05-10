const aws = require('aws-lambda-helper');
const taggy = require('taggable-searcher');
const async = require('async');

taggy.store.init(null, aws.version);

function get (ids, callback) {
  async.parallel(ids.map(function (id) {
    return function (next) {
      taggy.store.get(id, next);
    };
  }), function (err, data) {
    if (err) callback(err);
    return callback(null, data.map(function (d) {
      const doc = JSON.parse(d);
      return {
        id: doc._id,
        name: doc.displayName,
        url: doc.content[0].url,
        sections: doc.content[0].sections || []
      };
    }));
  });
}

module.exports.get = get;
