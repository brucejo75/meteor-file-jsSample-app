Meteor.startup(function clientStartup() {
  Uploads.resumable.on('fileAdded', function fileAdded(file) {
    Session.set(file.uniqueIdentifier, 0);
    return Uploads.insert({
      '_id': file.uniqueIdentifier,
      'filename': file.fileName,
      'contentType': file.file.type
    }, function fileAddedCB(err, _id) {
      let retVal = null;
      if(err) {
        console.warn('File creation failed!', err);
      } else {
        retVal = Uploads.resumable.upload();
      }
      Session.set('isUploading', Uploads.resumable.isUploading());
      return retVal;
    });
  });

  Uploads.resumable.on('fileProgress', function fileProgress(file) {
    Session.set('isUploading', Uploads.resumable.isUploading());
    return Session.set(file.uniqueIdentifier,
      Math.floor(100 * file.progress()));
  });

  Uploads.resumable.on('fileSuccess', function fileSuccess(file) {
    Session.set('isUploading', Uploads.resumable.isUploading());
    return Session.set(file.uniqueIdentifier, void 0);
  });

  Uploads.resumable.on('fileError', function fileError(file) {
    console.warn('Error uploading', file.uniqueIdentifier);
    Session.set('isUploading', Uploads.resumable.isUploading());
    return Session.set(file.uniqueIdentifier, void 0);
  });
});

// Template.registerHelper('truncateId', truncateId);
