myData = FileCollection({
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

if(Meteor.isClient) {
  Meteor.startup(function clientStartup() {
    myData.resumable.on('fileAdded', function fileAdded(file) {
      Session.set(file.uniqueIdentifier, 0);
      return myData.insert({
        '_id': file.uniqueIdentifier,
        'filename': file.fileName,
        'contentType': file.file.type
      }, function fileAddedCB(err, _id) {
        if(err) {
          console.warn('File creation failed!', err);
          return;
        }
        return myData.resumable.upload();
      });
    });

    myData.resumable.on('fileProgress', function fileProgress(file) {
      return Session.set(file.uniqueIdentifier,
        Math.floor(100 * file.progress()));
    });

    myData.resumable.on('fileSuccess', function fileSuccess(file) {
      return Session.set(file.uniqueIdentifier, void 0);
    });

    return myData.resumable.on('fileError', function fileError(file) {
      console.warn('Error uploading', file.uniqueIdentifier);
      return Session.set(file.uniqueIdentifier, void 0);
    });
  });

  Template.collTest.onRendered(function onRendered() {
    myData.resumable.assignDrop($('.fileDrop'));
    myData.resumable.assignBrowse($('.fileBrowse'));
  });

  Tracker.autorun(function consistentCookie() {
    let userId;
    userId = Meteor.userId();
    Meteor.subscribe('allData', userId);
    return $.cookie('X-Auth-Token', Accounts._storedLoginToken(), {
      'path': '/'
    });
  });

  shorten = function shortenName(name, width) {
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

  truncateId = function truncID(ident, len) {
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
  };

  Template.registerHelper('truncateId', truncateId);

  Template.collTest.events({
    'click .del-file': function cancelFile(e, t) {
      if(Session.get('' + this._id)) {
        console.warn('Cancelling active upload to remove file! ' + this._id);
        myData.resumable.removeFile(
          myData.resumable.getFromUniqueIdentifier('' + this._id));
      }
      return myData.remove({
        '_id': this._id
      });
    }
  });

  Template.collTest.helpers({
    'dataEntries': function dataEntries() {
      return myData.find({});
    },
    'numDataEntries': function numDataEntries() {
      return myData.find({}).count();
    },
    'shortFilename': function shortenFilename(width) {
      let ref;
      let w = width;
      if(w === null) {
        w = 16;
      }
      ref = this.filename && this.filename.length;
      return ref ? shorten(this.filename, w) : '(no filename)';
    },
    'owner': function owner() {
      let ref = this.metadata;
      let FOwner = ref && ref._auth && ref._auth.owner;
      return FOwner;
    },
    'id': function id() {
      return '' + this._id;
    },
    'link': function getLink() {
      return myData.baseURL + '/md5/' + this.md5;
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
        'image/tiff': true
      };
      return types[this.contentType] &&
        this.md5 !== 'd41d8cd98f00b204e9800998ecf8427e';
    },
    'loginToken': function loginToken() {
      Meteor.userId();
      return Accounts._storedLoginToken();
    },
    'userId': function userId() {
      return Meteor.userId();
    }
  });
}

if(Meteor.isServer) {
  Meteor.startup(function serverStartup() {
    Meteor.publish('allData', function allData(clientUserId) {
      let retVal = [];
      if(this.userId === clientUserId) {
        retVal = myData.find({
          'metadata._Resumable': {
            '$exists': false
          },
          'metadata._auth.owner': this.userId
        });
      }
      return retVal;
    });
    Meteor.users.deny({
      'update': function update() {
        return true;
      }
    });
    return myData.allow({
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
      'write': function write(userId, file, fields) {
        return file.metadata && file.metadata._auth &&
          file.metadata._auth.owner === userId;
      }
    });
  });
}
