const assert = require('assert');
const tile_mapper = require('../lib/tile_mapper');
const articles_fixture = require('./fixtures/articles.json');

describe('tile_mapper', function () {
  it('map_to_article: should return the article mapped object', function (done) {
    assert.deepEqual(tile_mapper.__map_to_article(articles_fixture[0]), articles_fixture[0]);
    done();
  });
  it('map: should filter out all tiles that were not mapped', function (done) {
    const tiles = [{id: 'hmm-exist-i-do-not-hmmm'}];
    assert.deepEqual(tile_mapper(tiles), []);
    done();
  });
  it('map: should call map_to_article when the tile is an article', function (done) {
    assert.deepEqual(tile_mapper(articles_fixture), articles_fixture);
    done();
  });
});
