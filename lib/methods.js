dumpData = new ValidatedMethod({
  'name': 'dumpData',
  'validate': new SimpleSchema({
    'filename': { 'type': String }
  }).validator(),
  run({filename}) {
    if(!this.isSimulation) {
      // get the file data with max size of 5000 bytes
      // Note: findOneStream is an extension of file-collection
      // see collections.js
      let fileStr = Uploads.findOneFile({'filename': filename}, 5000)
      .toString();
      FileData.upsert({'data': {'$exists': true}}, {'data': fileStr});
    }
  }
});

