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
      let bndStreamData = Meteor.bindEnvironment(function streamData(buf) {
        buffer = buffer + buf;
      });
      let bndStreamEnd = Meteor.bindEnvironment(function streamEnd() {
        fileData.upsert({'data': {'$exists': true}}, {'data': buffer});
      });
      // get the first 5K of the file stream
      let fStream = Uploads.findOneStream({'filename': filename},
        { 'range': { 'start': 0, 'end': 5000 }});

      // handle the stream
      fStream.on('data', bndStreamData);
      fStream.on('end', bndStreamEnd);
    }
  }
});
