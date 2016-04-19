function map_to_article (tile) {
  // Currrently this is a 1-2-1 mapping.
  return tile;
}

function map (tiles) {
  return tiles.map(function (tile) {
    if (tile.id.startsWith('tile:article')) {
      return map_to_article(tile);
    }
  }).filter(function (tile) {
    if (tile) return tile;
  });
}

module.exports = map;
module.exports.map = map; // For simple-mock
module.exports.__map_to_article = map_to_article; // For testing.
