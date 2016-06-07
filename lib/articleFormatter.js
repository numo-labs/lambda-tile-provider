const s3 = (item) => ({
  id: item.id,
  type: 'article',
  name: item.name,
  sections: item.sections,
  url: item.url
});

const sns = (item) => ({
  id: item.id,
  type: 'article',
  name: item.name,
  sections: item.sections && item.sections.length > 0 ? [{image: item.sections[0].image}] : []
});

exports.s3 = s3;
exports.sns = sns;
