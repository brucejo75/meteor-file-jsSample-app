Uploads = FileCollection({
  'resumable': true,
  'resumableIndexName': 'test',
  'http': [
    {
      'method': 'get',
      'path': '/md5/:md5',
      'lookup': function paramLookup(params) {
        return {
          'md5': params.md5
        };
      }
    }
  ]
});

fileData = new Mongo.Collection('fileData');

fileData.allow({
  'insert': () => false,
  'update': () => false,
  'remove': () => true
});

fileData.deny({
  'insert': () => true,
  'update': () => true,
  'remove': () => true
});
