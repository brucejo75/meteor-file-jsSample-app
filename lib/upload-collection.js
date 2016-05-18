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
