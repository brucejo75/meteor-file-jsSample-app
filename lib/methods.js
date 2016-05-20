dumpData = new ValidatedMethod({
  'name': 'dumpData',
  'validate': new SimpleSchema({
    'filename': { 'type': String }
  }).validator(),
  run({filename}) {
    if(!this.isSimulation) {
      let buffer = '';
      // because the stream is calling back in another context, need to bind
      // the callbacks to this context (e.g. so we can use the buffer variable)
      let bndStreamEnd = Meteor.bindEnvironment(function streamEnd() {
        fileData.upsert({'data': {'$exists': true}}, {'data': buffer});
        console.log(buffer);
      });
      let bndStreamData = Meteor.bindEnvironment(function streamData(buf) {
        // handle up to 10K
        if(buffer.length < 10000) {
          buffer = buffer + buf;
        }
      });
      // get the file stream
      let fStream = Uploads.findOneStream({'filename': filename});
      // handle the stream
      fStream.on('data', bndStreamData);
      fStream.on('end', bndStreamEnd);
    }
  }
});
