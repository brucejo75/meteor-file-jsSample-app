import toBuffer from 'stream-with-known-length-to-buffer';

dumpData = new ValidatedMethod({
  'name': 'dumpData',
  'validate': new SimpleSchema({
    'filename': { 'type': String }
  }).validator(),
  run({filename}) {
    if(!this.isSimulation) {
      // get fileData so we can know length
      let fileData = Uploads.findOne({'filename': filename});
      let maxStream = fileData.length > 5000 ? 5000 : fileData.length;

      // have to bind the callback to this context
      let bndStreamedBuffer = Meteor.bindEnvironment(
        function streamedBuffer(err, buf) {
          FileData.upsert({'data': {'$exists': true}},
            {'data': buf.toString()});
        });

      toBuffer(Uploads.findOneStream({'filename': filename},
        { 'range': { 'start': 0, 'end': maxStream }}), maxStream,
        bndStreamedBuffer
        );
    }
  }
});
