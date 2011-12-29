goog.provide('dm.Log');
goog.require('jsDump');
goog.require('Delegator');
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
dm.Log = {
  levels: ['error', 'info', 'debug','fine'],
  root: null,
  count: 0,

  impl: function(level) {
    return function() {
      dm.Log.write(level, Array.prototype.slice.apply(arguments));
    };
  },

  write: function(level, args) {
    var
      hd = args.shift(),
      bd = dm.Log.dumpArray(args);

    dm.Log.writeHTML(level, hd, bd);
  },

  dumpArray: function(args) {
    var bd = '';

    for (var i=0, l=args.length; i<l; i++) {
      if (bd) {
        bd += '<hr>';
      }
      bd += jsDump.parse(args[i]);
    }

    return bd;
  },

  writeHTML: function(level, hd, bd) {
    if (level > dm.Log.level) {
     // return;
    }

    var entry = document.createElement('div');
    entry.className = 'log-entry log-' + dm.Log.levels[level];
    entry.innerHTML = dm.Log.genBare(hd, bd);
    dm.Log.root.insertBefore(entry, dm.Log.root.firstChild);
  },

  genBare: function(hd, bd) {
    return (
      '<div class="hd">' +
        '<span class="toggle">&#9658;</span> ' +
        '<span class="count">' + (++dm.Log.count) + '</span> ' +
        hd +
      '</div>' +
      (bd ? '<div class="bd" style="display: none;">' + bd + '</div>' : '')
    );
  },

  genHTML: function(hd, bd) {
    return '<div class="log-entry">' + dm.Log.genBare(hd, bd) + '</div>';
  },

  clear: function() {
    dm.Log.root.innerHTML = '';
    dm.Log.count = 0;
  },

  getLevel: function(name) {
    for (var i=0, l=dm.Log.levels.length; i<l; i++) {
      if (name == dm.Log.levels[i]) {
        return i;
      }
    }
    return l; // max level
  },

  init: function(root, levelName) {
    jsDump.HTML = true;
    dm.Log.level = dm.Log.getLevel(levelName);
    dm.Log.root = root;
    root.style.height = (
      (window.innerHeight || document.documentElement.clientHeight)
      + 'px'
    );
    for (var i=0, l=dm.Log.levels.length; i<l; i++) {
      var name = dm.Log.levels[i];
      dm.Log[name] = dm.Log.impl(i);
      dm.Log[name].bind = function(title) {
        var self = this;
        return function() {
          var args = Array.prototype.slice.apply(arguments);
          args.unshift(title);
          self.apply(null, args);
        };
      };
    }

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
};
