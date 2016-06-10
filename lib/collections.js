import toBuffer from 'stream-with-known-length-to-buffer';

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

FileData = new Mongo.Collection('fileData');

FileData.allow({
  'insert': () => false,
  'update': () => false,
  'remove': () => true
});

FileData.deny({
  'insert': () => true,
  'update': () => true,
  'remove': () => true
});


// file-collection does not offer a meteor synchronous find File operation
// findOneFile will return the file as binary data to get into a string
// use .toString()
_.extend(Uploads, {
  'findOneFile': function _findOneFile(selector, max, options) {
    let file = Uploads.findOne(selector, options);
    let maxStream = Math.min(max, file.length);
    let wrappedToBuffer = Meteor.wrapAsync(toBuffer);
    enhancedOptions = options || {};
    enhancedOptions.range = { 'start': 0, 'end': maxStream };


    return wrappedToBuffer(Uploads.findOneStream(selector, enhancedOptions),
      maxStream);
  }
});
