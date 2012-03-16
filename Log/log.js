goog.provide('dm.Log');
goog.require('jsDump');
goog.require('Delegator');

var console = window['console'] || {log:function(){}};
/*
<div class="controls">
<button onclick="dm.Log.clear()">Clear</button>
</div>

<div id="log"></div>
</div>
//log
 dm.Log.init(document.getElementById("log"),'debug');
 dm.Log.debug("log inited");

 var data = {df:"log inited",dfff:'dfdfd'};
 dm.Log.debug.bind('myll')(data);
 dm.Log.debug.bind('myll')("nnallldlldf");
*/
var LOG = {
  levels: ['error', 'info', 'debug','fine'],
  root: null,
  count: 0,

  impl: function(level) {
    return function() {
		//console.log('in log',arguments);
        LOG.write(level, Array.prototype.slice.apply(arguments));
    };
  },

  write: function(level, args) {
    if (level > LOG.level) {
        return;
    }
	var name = LOG.levels[level],
      hd = args.shift(),
	  f = console[name];
	if(typeof f === typeof setTimeout ){
		f.call(console,name,hd,args);
	}else
		console.log(name,hd,args);

	if(!LOG.root)
		return;
    bd = LOG.dumpArray(args),
    LOG.writeHTML(level, hd, bd);
  },

  dumpArray: function(args) {
    var bd = '';
    for (var i=0, l=args.length; i<l; i++) {
      if (bd) {
        bd += '<hr>';
      }
	  console.log(jsDump);
      bd += jsDump.parse(args[i]);
    }
    return bd;
  },

  writeHTML: function(level, hd, bd) {

    var entry = document.createElement('div');
    entry.className = 'log-entry log-' + LOG.levels[level];
    entry.innerHTML = LOG.genBare(hd, bd);
    LOG.root.insertBefore(entry, LOG.root.firstChild);
  },

  genBare: function(hd, bd) {
    return (
      '<div class="hd">' +
        '<span class="toggle">&#9658;</span> ' +
        '<span class="count">' + (++LOG.count) + '</span> ' +
        hd +
      '</div>' +
      (bd ? '<div class="bd" style="display: none;">' + bd + '</div>' : '')
    );
  },

  genHTML: function(hd, bd) {
    return '<div class="log-entry">' + LOG.genBare(hd, bd) + '</div>';
  },

  clear: function() {
    LOG.root.innerHTML = '';
    LOG.count = 0;
  },

  getLevel: function(name) {
    for (var i=0, l=LOG.levels.length; i<l; i++) {
      if (name == LOG.levels[i]) {
        return i;
      }
    }
    return l; // max level
  },

  init: function(root, levelName) {
    jsDump.HTML = true;
    LOG.level = LOG.getLevel(levelName);
	//*
    for (var i=0, l=LOG.levels.length; i<l; i++) {
      var name = LOG.levels[i];
	  //console.log('in LOG.init',i,name);
      LOG[name] = LOG.impl(i);
      LOG[name].bind = function(title) {
        var self = this;
        return function() {
          var args = Array.prototype.slice.apply(arguments);
          args.unshift(title);
          self.apply(null, args);
        };
      };
    }
    //*/
  //levels: ['error', 'info', 'debug','fine'],
  LOG.error=LOG['error']
  LOG.info=LOG['info']
  LOG.debug=LOG['debug']
  LOG.fine=LOG['fine']
	
  LOG.root = root || null
  if(root){
	  root.style.height = (
		  (window.innerHeight || document.documentElement.clientHeight)
		  + 'px'
	  );
	  Delegator.listen('.log-entry .toggle', 'click', function() {
		  try {
			  var style = this.parentNode.nextSibling.style;
			  if (style.display == 'none') {
				  style.display = 'block';
				  this.innerHTML = '&#9660;';
			  } else {
				  style.display = 'none';
				  this.innerHTML = '&#9658;';
			  }
		  } catch(e) {
			  // ignore, the body is probably missing
		  }
	  });
  }
  }

};
dm.Log = LOG
