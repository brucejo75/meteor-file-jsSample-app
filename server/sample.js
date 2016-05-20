Meteor.startup(function serverStartup() {
  Meteor.publish('allData', function allData(clientUserId) {
    check(clientUserId, null);
    let retVal = [];
    if(this.userId === clientUserId) {
      retVal = Uploads.find({
        'metadata._Resumable': {
          '$exists': false
        },
        'metadata._auth.owner': this.userId
      });
    }
    return retVal;
  });

  Meteor.publish('fileData', function pubFileData() {
    return fileData.find({});
  });

  let query = Uploads.find({'metadata._Resumable': {'$exists': false}});
  query.observe({
    removed: function cleanUpIncompleteFiles(rmFile) {
      Uploads.remove({
        'metadata._Resumable.resumableIdentifier': rmFile._id._str
      });
    }
  });
});

Uploads.allow({
  'insert': function insert(userId, file) {
    file.metadata = file.metadata || {};
    file.metadata._auth = {'owner': userId};
    return true;
  },
  'remove': function remove(userId, file) {
    return file.metadata && file.metadata._auth &&
      file.metadata._auth.owner === userId;
  },
  'read': function read(userId, file) {
    return file.metadata && file.metadata._auth &&
      file.metadata._auth.owner === userId;
  },
  'write': function write(userId, file) {
    return file.metadata && file.metadata._auth &&
      file.metadata._auth.owner === userId;
  }
});
