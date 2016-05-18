Template.collTest.onCreated(function onCreated() {
  let template = this;
  template.pause = new ReactiveVar(false);

  template.autorun(function subscribeToData() {
    let userId = Meteor.userId();
    Meteor.subscribe('allData', userId);
    $.cookie('X-Auth-Token', Accounts._storedLoginToken(), {
      'path': '/'
    });
  });
});

Template.collTest.onRendered(function onRendered() {
  Uploads.resumable.assignDrop($('.fileDrop'));
  Uploads.resumable.assignBrowse($('.fileBrowse'));
});

function shorten(name, width) {
  let w = width;
  let retVal;
  if(w === null) {
    w = 16;
  }
  w += w % 4;
  w = (w - 4) / 2;
  if(name.length > 2 * w) {
    retVal = name.slice(0, +w + 1 || 9e9) + '…' + name.slice(-w - 1);
  } else {
    retVal = name;
  }
  return retVal;
};

Template.collTest.events({
  'click .del-file': function cancelFile() {
    if(Session.get('' + this._id)) {
      console.warn('Cancelling active upload to remove file! ' + this._id);
      Uploads.resumable.getFromUniqueIdentifier('' + this._id).cancel();
      Session.set('isUploading', Uploads.resumable.isUploading());
    }
    return Uploads.remove({
      '_id': this._id
    });
  },
  'click .filePause': function pauseFiles(e, t) {
    Uploads.resumable.pause();
    t.pause.set(true);
  },
  'click .fileResume': function pauseFiles(e, t) {
    Uploads.resumable.upload();
    t.pause.set(false);
  }
});

Template.collTest.helpers({
  // state helpers
  'paused': function isPaused() {
    return Template.instance().pause.get();
  },
  'isUploading': function isUploading(id) {
    let retVal;
    if(id) {
      retVal = Session.get('' + id);
    } else {
      retVal = Session.get('isUploading');
    }
    return retVal;
  },
  // file  helpers
  'files': function dataEntries() {
    let cursor = Uploads.find({});
    if(cursor.count() === 0) {
      Template.instance().pause.set(false);
    }
    return cursor;
  },
  'owner': function owner() {
    let ref = this.metadata;
    let FOwner = ref && ref._auth && ref._auth.owner;
    return FOwner;
  },
  // 'id': function id() {
  //   return '' + this._id;
  // },
  'link': function getLink() {
    return Uploads.baseURL + '/md5/' + this.md5;
  },
  'uploadStatus': function uploadStatus() {
    let percent;
    percent = Session.get('' + this._id);
    return percent ? 'Processing...' : 'Uploading...';
  },
  'formattedLength': function formattedLength() {
    return numeral(this.length).format('0.0b');
  },
  'uploadProgress': function uploadProgress() {
    return Session.get('' + this._id);
  },
  'isImage': function isImage() {
    let types = {
      'image/jpeg': true,
      'image/png': true,
      'image/gif': true,
      'image/bmp': true,
      'image/tiff': true
    };
    // image file and not an empty file
    return types[this.contentType] &&
      this.md5 !== 'd41d8cd98f00b204e9800998ecf8427e';
  },
  // Name truncation helpers
  'shortFilename': function shortenFilename(width) {
    let ref;
    let w = width;
    if(w === null) {
      w = 16;
    }
    ref = this.filename && this.filename.length;
    return ref ? shorten(this.filename, w) : '(no filename)';
  },
  'truncateId': function truncID(ident, len) {
    let length = len;
    let id = ident;
    let retVal;
    if(length === null) {
      length = 6;
    }
    if(id) {
      if(typeof id === 'object') {
        id = '' + id.valueOf();
      }
      retVal = id.substr(0, 6) + '…';
    } else {
      retVal = '';
    }
    return retVal;
  }
});
