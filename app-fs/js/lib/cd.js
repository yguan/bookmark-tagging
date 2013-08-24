/*

cd.js - a method-chaining library for the HTML5 file system API
----------------------------------------------------------------
(c) 2012 Zoran Obradović, Ljudmila.org. GPL 3.0 applies.
----------------------------------------------------------------

*/

/*
  F R I E N D L Y   A C C E S S   F U N C T I O N
*/

function cd(arg) {
  if (arguments.length == 0) return new CD('/');
  if (typeof arg == 'function') {
    if (CD.fs) arg();
    else CD._onready.push(arg); 
    return;
  }
  if (arg && arg.cwd) return new CD(arg);
  return new CD(arg);
}

/*
  Q U E U E  TODO: integrate in CD
*/

window.addEventListener('load', function () {
  if (!window.cdOptions || !window.cdOptions.dont) CD.init(window.cdOptions);
});

function Queue(owner) {
  this._owner = owner || this;
  // store your callbacks
  this._methods = [];
  this._running = false;
}

Queue.prototype = {
  // adds callbacks to your queue
  add: function(fn) {
    //console.log('inserting at',this._methods.length);
    this._methods.push(fn);
    if(!this._running) this.next();
  },
  next: function() {
    if (this._methods.length == 0) {
      this._running = false;
    } else {
      this._running = true;
      this._methods.shift()(this._owner);
    }
  }
};

/*
  C O N S T R U C T O R
*/


function CD (dir) {
  this._onerror = function(e) {
    for (var i in e) if (e[i] == e) { e=e[i]; break; }
    console.trace();
    console.log(e,arguments.callee.cd.lastPath);
  };
  this._onerror.cd = this;
  this.queue = new Queue(this);
  this.cwd = CD.fs.root;
  this.counter = 0;
  var me = this;
  me.then( function (){
    me.cd(dir);
  });
  return;
  me.cwd.getDirectory(dir, {}, function(dirEntry) {
    me.cwd = dirEntry;
    me.queue.next();
  }, me._onerror);
}
/*
  I N I T
*/
CD.errors = {
  
},
CD._onready = [];

CD._init = function(op) {
  window.webkitRequestFileSystem(PERSISTENT, 20*1024*1024, function(fs) {
    CD.fs = fs;
    while(CD._onready.length) CD._onready.shift()();
      op.success();
  }, function() {
      console.log('no file system!');
      op.failure();
  });
}

CD.init = function(options, op) {
    navigator.webkitPersistentStorage.requestQuota(1024*1024*1024, function(grantedBytes) {
        CD.grantedBytes = grantedBytes;
        CD._init(op);
    }, op.failure);
}

CD.echo = function () {
  console.log.apply(console,arguments);
}

/*
  P A T H   N O R M A L I Z A T I O N
*/

CD.splitPath = function(path,from) {
  from = from || '/';
  from = from && from.fullPath ? from.fullPath : from;
  path = path.fullPath || path;
  
  if (path[0]=='/') {
    from = '';
  }
  path = from+'/'+path;
  var p1 = path.split(/[/]+/);
  var p2 = [];
  p2.file = p1.pop();
  while (p1.length) {
    var chunk = p1.shift();
    if (!chunk) continue;
    if (chunk == '.') continue;
    if (chunk == '..') {
      p2.length && p2.pop();
      continue;
    }
    p2.push(chunk);
  }
  p2.dir = '/'+p2.join('/');

  p2.push(p2.file);
  p2.path = '/'+p2.join('/');
  return p2;
}
CD.normalize = function(path,from) {
  return CD.splitPath(path,from).path
}

/*
  P R O T O T Y P E
*/


CD.prototype = {
  /*
    Q U E U E   TODO: integrate Queue from above
  */
  then: function then (fn,data)   {
    if (!fn) return;
    var cnt = this.counter ++;
    var me = this;
    //console.log('add',cnt);
    this.queue.add(function then(me) {
      //console.log('exec',cnt);
      var Q = me.queue._methods;
      me.queue._methods = [];
      var done = function(res) {
        setTimeout(function() {
          //console.log('done',cnt);
          if (Q!==null) {
            me.queue._methods = me.queue._methods.concat(Q);
            me.queue.next();
          }
          Q=null;
        },0)
      }
      var res = fn.apply(me,[done,data]);
      if (res!==true) done();
    });
    
    return this;
  },

  /*
    path helpers
  */
  splitPath: function (path,from) {
    return CD.splitPath(path,from || this.cwd);
  },
  normalize: function (path,from) {
    return CD.normalize(path,from || this.cwd);
  },
  /*
    FS helpers  
  */
  _getEntry: function(path,cb1,cb2) {
    var me = this;
    path = this.normalize(path);
    
    CD.fs.root.getDirectory(path,{},function(entry){
      cb1.apply(me,[entry])
    },function() {
      CD.fs.root.getFile(path,{},function(entry){
         cb1.apply(me,[entry])
      }, me._wrap(cb2 || me._onerror));
    });
  },
  _getFile: function(path,cb1,cb2) {
    var me = this;
    path = this.normalize(path);
    me.lastPath = 'get file '+path;
    CD.fs.root.getFile(path,{},function(entry){
      cb1.apply(me,[entry])
    }, me._wrap(cb2 || me._onerror));
  },
  _getDir: function(path,cb1,cb2) {
    var me = this;
    path = this.normalize(path);
    me.lastPath = 'get dir '+path;
    CD.fs.root.getDirectory(path,{},function(entry){
      cb1.apply(me,[entry])
    }, me._wrap(cb2 || me._onerror));
  },
  _getParent: function(path,cb1,cb2) {
    var me = this;
    path = this.splitPath(path);
    me.lastPath = 'get parent '+path.dir;
    CD.fs.root.getDirectory(path.dir,{},function(entry){
        cb1.apply(me,[entry])
    }, me._wrap(cb2 || me._onerror));
  },
  _createFile: function(path,cb1,cb2) {
    var me = this;
    path = this.normalize(path);
    me.lastPath = path;
    CD.fs.root.getFile(path,{create:true},function(entry){
        cb1.apply(me,[entry])
    }, me._wrap(cb2 || me._onerror));
  },
  _createDir: function(path,cb1,cb2) {
    var me = this;
    path = this.normalize(path);
    me.lastPath = path;
    CD.fs.root.getDirectory(path,{create:true},function(entry){
      cb1.apply(me,[entry])
    }, me._wrap(cb2 || me._onerror));
  },

  /*
    C W D
  */

  

  pwd: function pwd() {
    this.then(function() {
      this.echo(this.cwd.fullPath);
    });
    return this;
  },
  cd: function cd(dir) {
    var me = this;
    this.then(function(done) {
      this._getDir(dir, function(dirEntry) {
        this.cwd = dirEntry;
        done();
      });
      return true;
    });
    return this;
  },
  up: function() {
    this.cd('..');
    return this;
  },
  root: function() {
    this.cd('/');
    return this;
  },
  /*
    D I R E C T O R Y   I T E R A T O R S
  */
  // basic for loop

  for: function for_(glob,cbFound,cbNotFound) {
    var me = this;
    function loop(entries, done) {
      //console.log('found',glob,entries);
      if (!entries.length) {
        me.then(cbNotFound);
        done();
        return true;
      }
      entries.sort(function(a,b) {
        return a.name > b.name ? 1 : -1;              
      });
      for ( var i = 0; i<entries.length; i++) {
        entry = entries[i];
        if (entries.length == 1) entry.single = true;
        entry.list = entries;
        entry.index = i;
        me.then(cbFound, entry);
      }
      done();
      return true;
    }
  
    this.then(function(done) {
      //console.log('looking for',glob);
      if (glob instanceof Array) return loop(glob,done);

      var parts = this.splitPath(glob);
      var dir = parts.dir;
      var file = parts.file;
      if (dir.match(/[*?]/)) {
        me._onerror('bad glob');
        return true;
      }

      
      if (!file.match(/[*?]/)) {
        //console.log('single',glob);
        this._getEntry(glob,function(entry){
          loop([entry],done);
        },function() {
          loop([],done);
        });
        return true;
      }

      var re = new RegExp('^'+file.replace(/[?]/g,'.').replace(/[*]/g,'.*')+'$');
      me._getDir(dir, function (dirEntry) {
        var entries = [];
        var reader = dirEntry.createReader();
        (function readEntries (me) {
          reader.readEntries(function(results) {
            if (!results.length) {
              //console.log('globbed',glob);
              loop(entries,done);
            } else {
              for (var i = 0, e; e = results[i]; i++) if(e.name.match(re)) entries.push(e);
              readEntries(me);
            }
          }, me._onerror);
        })(me);
      });
      return true;
    });
    return this;
  },

  // like for, but includes metadata
  ls: function ls(glob,cbFound,cbNotFound) {
    var me = this;
    this.echo('ls',glob||'*');
    this.for(glob||'*',function(done,f) {
      f.getMetadata(function(data) {
        me.echo(f.fullPath, data.modificationTime);
        f.metaData = data;
        me.then(cbFound,f);
        done();
      })
      return true;
    },cbNotFound)
    return this;
  },

  // like for, but includes metadata
  byType: function(glob,cbFile,cbDir,cbNotFound) {
    this.for(glob,function(done,entry) {
      this.then(entry.isDirectory ? cbDir : cbFile, entry);
    },cbNotFound);
    return this;
  },
  files: function(glob,cbFound,cbNotFound) {
    var found = false;
    this.for(glob,function(done,entry) {
      if (entry.isFile) {
        found = true;
        this.then(cbFound, entry);
      }
      if (!found) this.then(cbNotFound);
    },cbNotFound);
  },
  directories: function(glob,cbFound,cbNotFound) {
    var found = false;
    this.for(glob,function(done,entry) {
      if (entry.isDirectory) {
        found = true;
        this.then(cbFound, entry);
      }
      if (!found) this.then(cbNotFound);
    },cbNotFound);
  },

  /*
    R E A D   /   W R I T E
  */
  read: function read (glob,cbFound,cbNotFound) {
    var me = this;
    this.for(glob, function(done,entry) {
      if (!entry.isFile) return;
      entry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
          this.result.file = file;
          me.then(cbFound,this.result);
          done();
        };
        reader.readAsText(file);
      });
      return true;
    }, cbNotFound);
  },  
  write: function write(filename,content,type) {
    var me = this;
    type = type || 'text/plain';
    this.then(function(done) {
      me.cwd.getFile(filename, {create: true}, function(fileEntry) {
        console.log('write ',fileEntry.fullPath);
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('wtf');
            done();
          };

          fileWriter.onerror = function(e) {
            me._onerror(e);
          };
          if (content instanceof Blob) {
            fileWriter.write(content); 
          } else {
            var blob = new Blob([content], {type: type});
            fileWriter.write(blob);
          }
        }, me._onerror);
      }, me._onerror);
      return true;
    });
    return this;
  },



  mkdir: function mkdir(path) {
    var me = this;
    var fnDone;
    function doMkdir(where, pathArray) {
      where.getDirectory(pathArray[0], {create: true}, function(dirEntry) {
        if (!pathArray.length) {
          fnDone();
          return;
        };
        doMkdir(dirEntry, pathArray.slice(1));
      });
    }
    me.then(function(done) {
      fnDone = done;
      var pathArray = me.splitPath(path);
      doMkdir(CD.fs.root,pathArray);
    });
    
    return this;
  },
  rm: function rm(glob,cbNotFound) {
    var me = this;
    this.for(glob, function(done,file) {
      if (file.isFile) {
        file.remove(done, me._onerror);
        return true;
      }
    },cbNotFound)
    return this;
  },
  rmrf: function (glob,cbNotFound) {
    var me = this;
    this.for(glob, function(done,file) {
      file[ file.isFile ? 'remove' : 'removeRecursively' ] (done, me._onerror);
    },cbNotFound)
    return this;
  },
  _mvcpSingle: function (action,glob,dest,done,cbNotFound) {
    var me = this;
      console.log('mv',glob,me.cwd.fullPath);
    this.for(glob, function(done,entry) {
      console.log('mv',glob,me.cwd.fullPath);
      if (!entry.single) {
        this._onerror('destination not single');
        return true;
      }
      var p = me.splitPath(dest);
      this._getDir(p.dir, function (destEntry) {
        console.log(action,destEntry.fullPath,p.file);
        entry[action+'To'](destEntry,p.file,done,this._onerror);
      });
      return true;
    },cbNotFound);
  },
  mv: function (glob,dest,cbNotFound) {
    this.for(dest, function(done,destEntry) {
      if (!destEntry.single) {
        this._onerror();
      }
      if (destEntry.isDirectory) {
        this.for(glob, function(entry,done) {
          entry.moveTo(destEntry,null,done,this._onerror);
        },cbNotFound);
      } else {
        this._mvcpSingle('move',glob,dest,done,cbNotFound);
      };
      return true;
    }, function(done) {
      this._mvcpSingle('move',glob,dest,done,cbNotFound);
      return true;
    })
    return this;
  },
  cp: function (glob,dest,cbNotFound) {
    this.for(dest, function(done,destEntry) {
      if (!destEntry.single) {
        this._onerror('cp - destination not single');
      }
      if (destEntry.isDirectory) {
        this.for(glob, function(entry,done) {
          entry.copyTo(destEntry,null,done,this._onerror);
        },cbNotFound);
      } else {
        this._mvcpSingle('copy',glob,dest,done,cbNotFound);
      };
      return true;
    }, function(done) {
      this._mvcpSingle('copy',glob,dest,done,cbNotFound);
    })
    return this;
  },
  /*
    D E B U G G I N G
  */
  echo: function() {
    var args = arguments;
    return this.then( function echo () {
      CD.echo.apply(this,args);
    });
  },
  /*
    E R R O R   H A N D L I N G
  */
  onerror: function onerror(handler) {
    this.queue.add(function(me) {
      me._onerror = handler;
      me.queue.next();
    });
    return this;
  },
  throw: function(errorCode) {
  },
  _wrap: function(fn) {
    var me = this;
    return function() {
      console.log('wrapped',arguments);
      fn.apply(me,arguments);
    }
  }
};

module.exports = {
    cd: cd,
    init: CD.init
};


