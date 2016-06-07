const s3 = (item, searchId) => ({
  id: item.id,
  type: 'destination',
  name: item.name,
  sections: item.sections,
  url: item.url
});

const sns = (item, searchId) => (s3(item, searchId));

exports.s3 = s3;
exports.sns = sns;
