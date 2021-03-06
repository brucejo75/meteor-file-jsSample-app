# meteor-file-jsSample-app
Port of [meteor-file-sample-app](https://github.com/vsivsi/meteor-file-sample-app) from COFFEE / JADE / SEMANTIC UI to JS / HTML / BOOTSTRAP

The [meteor-file-collection](https://github.com/vsivsi/meteor-file-collection) looks like a nice tidy package for doing simple
file uploads.  I am completely ignorant of Coffee Script, Jade and Semantic UI and unfortunately for me meteor-file-collection is
implemented with those technologies

As part of learning how to use meteor-file-collection
I decided to port the sample app over to JS, HTML and Bootstrap.  In the process I figured out how to use it.

I also figured that I would share the code so others in my predicament could take advantage of it.

Many thanks to [vsivsi](https://github.com/vsivsi)!

Enjoy!
## Build Instructions
```
meteor npm install
meteor
```

### <a name="update-6010-16"><a>6-10-2016 Update
* Extended file-collection with `findOneFile`.  This will return the file data sychronously.
* Added fix for [flow router issue](https://github.com/brucejo75/meteor-file-jsSample-app/issues/2).

### <a name="update-5-20-16"><a>5-20-2016 Update
* Limited panel output to 5K
* Clear panel on restart
* integrate stream-with-known-length-to-buffer, turns a stream into a buffer

### <a name="update-5-19-16"><a>5-19-2016 Update
* Added support for dumping the data to an output panel.  This shows how to read the data back from the file collection.
* A little bit of refactoring and added a couple of comments

### <a name="update-5-18-16"><a>5-18-2016 Update
* Added support for `Pause All` and `Resume All`
* Refactored to meteor client/server/lib directories, broke out template code

### <a name="update-5-16-16"><a>5-16-2016 Update
* Initial commit
* Added "Upload" button
* Added some sparse instructions

