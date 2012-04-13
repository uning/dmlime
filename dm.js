
goog.provide('dm');

goog.require('goog.events');

goog.require('goog.events.EventType');

goog.require('goog.debug.DivConsole');

goog.require('goog.dom');

goog.require('bootstrap');

goog.require('goog.dom.classes');

goog.require('goog.object');

goog.require('lime.Director');

goog.require('lime.GlossyButton');

goog.require('lime.Layer');

goog.require('lime.Scene');

goog.require('lime.transitions.Dissolve');

goog.require('dm.Board');

goog.require('dm.IconManager');

goog.require('dm.Button');

goog.require('dm.Game');

goog.require('dm.Help');

goog.require('dm.User');

goog.require('dm.Display');

goog.require('goog.net.XhrIo');

goog.require('goog.json');

goog.require('dm.Log');

goog.require('dm.Login');

goog.require('dm.Loader');

goog.require('dm.LDB');

dm.WIDTH = 720;

dm.HEIGHT = 1004;

dm.BOARDSIZE = 690;

dm.GEMTYPES = ['monster', 'hp', 'mana', 'sword', 'gold'];

dm.SERVER = 'http://dm.playcrab.com/';

dm.SERVER = './';

dm.APIURL = 'api.php';

dm.api = function(m, param, callback) {
  var proc;
  dm.log.fine(m, 'api call ', param);
  proc = function(e) {
    var obj, xhr;
    xhr = e.target;
    obj = xhr.getResponseJson();
    dm.log.fine(m, 'api response', obj);
    return callback && callback(obj);
  };
  return goog.net.XhrIo.send(dm.APIURL + '?m=' + m, proc, 'POST', goog.json.serialize({
    m: m,
    p: param
  }), {
    'Content-Type': 'application/json;charset=utf-8'
  });
};

dm.loadCover = function() {
  var cover, help, layer, load, scene, score, start;
  scene = new lime.Scene;
  layer = new lime.Layer().setPosition(dm.WIDTH / 2, dm.HEIGHT / 2);
  cover = new lime.Sprite().setFill('dmdata/dmimg/cover.png');
  layer.appendChild(cover);
  /* btns
  */
  start = new lime.Sprite().setPosition(120, -150).setFill('dmdata/dmimg/cstart1.png');
  load = new lime.Sprite().setPosition(140, -70).setFill('dmdata/dmimg/cload1.png');
  score = new lime.Sprite().setPosition(140, -70).setFill('dmdata/dmimg/cscore1.png');
  help = new lime.Sprite().setPosition(160, 10).setFill('dmdata/dmimg/chelp1.png');
  goog.events.listen(start, ['mousedown', 'touchstart'], function(e) {
    this.setFill('dmdata/dmimg/cstart3.png');
    return e.swallow(['mouseup', 'touchend', 'touchcancel'], function() {
      var fc;
      this.setFill('dmdata/dmimg/cstart1.png');
      fc = function() {
        return dm.newgame(6);
      };
      return fc();
    });
  });
  goog.events.listen(help, ['mousedown', 'touchstart'], function(e) {
    this.setFill('dmdata/dmimg/chelp3.png');
    return e.swallow(['mouseup', 'touchend', 'touchcancel'], function() {
      this.setFill('dmdata/dmimg/chelp1.png');
      return dm.loadHelpScene();
    });
  });
  goog.events.listen(load, ['mousedown', 'touchstart'], function(e) {
    this.setFill('dmdata/dmimg/cload3.png');
    return e.swallow(['mouseup', 'touchend', 'touchcancel'], function() {
      this.setFill('dmdata/dmimg/cload1.png');
      return dm.loadGame();
    });
  });
  goog.events.listen(score, ['mousedown', 'touchstart'], function(e) {
    this.setFill('dmdata/dmimg/cscore3.png');
    return e.swallow(['mouseup', 'touchend', 'touchcancel'], function() {
      return this.setFill('dmdata/dmimg/cscore1.png');
    });
  });
  cover.appendChild(start);
  cover.appendChild(load);
  cover.appendChild(help);
  scene.appendChild(layer);
  dm.LDB.get('topscore', function(data) {
    var topscore, topscoreLabel;
    if (data) {
      topscore = new lime.Sprite().setPosition(-230, -180).setFill('dmdata/dmimg/topscore.png').setSize(140, 50);
      topscoreLabel = new lime.Label().setFontSize(30).setPosition(0, 8).setText(data);
      topscore.appendChild(topscoreLabel);
      return this.appendChild(topscore);
    }
  }, cover);
  return dm.director.replaceScene(scene, lime.transitions.Dissolve);
};

dm.loadMenu = function() {
  var btn, btn_help, btn_load, btns, btns2, layer, lbl, move, scene;
  scene = new lime.Scene;
  layer = new lime.Layer().setPosition(dm.WIDTH / 2, 0);
  btns = new lime.Layer().setPosition(0, 0);
  layer.appendChild(btns);
  move = new lime.animation.MoveBy(-dm.WIDTH, 0).enableOptimizations();
  btn = dm.makeButton('开始').setPosition(0, 200);
  goog.events.listen(btn, ['click', 'touchstart'], function() {
    dm.log.fine('game start');
    return btns.runAction(move);
  });
  btns.appendChild(btn);
  btn_help = dm.makeButton('帮助').setPosition(0, 400);
  goog.events.listen(btn_help, ['click', 'touchstart'], function() {
    return dm.loadHelpScene();
  });
  btns.appendChild(btn_help);
  btn_load = dm.makeButton('载入').setPosition(0, 600);
  goog.events.listen(btn_load, ['click', 'touchstart'], function() {
    dm.newgame(6);
    return dm.game.loadGame();
  });
  btns.appendChild(btn_load);
  btns2 = new lime.Layer;
  btns2.setPosition(dm.WIDTH, 0);
  btns.appendChild(btns2);
  lbl = new lime.Label().setText('Select board size:').setFontColor('#fff').setFontSize(24).setPosition(0, 140);
  btns2.appendChild(lbl);
  btn = dm.makeButton('6x6').setPosition(0, 200);
  goog.events.listen(btn, 'click', function() {
    return dm.newgame(6);
  });
  btns2.appendChild(btn);
  btn = dm.makeButton('7x7').setPosition(0, 320);
  goog.events.listen(btn, 'click', function() {
    return dm.newgame(7);
  });
  btn = dm.makeButton('8x8').setPosition(0, 440);
  goog.events.listen(btn, 'click', function() {
    return dm.newgame(8);
  });
  scene.appendChild(layer);
  return dm.director.replaceScene(scene, lime.transitions.Dissolve);
};

dm.makeButton = function(text) {
  var btn;
  return btn = new dm.Button(text).setSize(300, 90);
};

dm.isBrokenChrome = function() {
  return /Chrome\/9\.0\.597/.test(goog.userAgent.getUserAgentString);
};

dm.newgame = function(size) {
  var func;
  func = function(old) {
    if (typeof old === 'undefined' || old === null) old = false;
    dm.game = new dm.Game(size, null, !old);
    return dm.director.replaceScene(dm.game, lime.transitions.Dissolve);
  };
  return dm.LDB.get('olduser', func, this);
};

dm.loadHelpScene = function() {
  var scene;
  scene = new dm.Help;
  dm.builtWithLime(scene);
  return dm.director.replaceScene(scene, lime.transitions.Dissolve);
};

dm.loadGame = function() {
  var func;
  func = function(data) {
    var guide;
    if (typeof data === 'undefined' || data === null) {
      guide = true;
      dm.game = new dm.Game(6, null, guide);
    } else {
      dm.game = new dm.Game(6, null, false);
      dm.game.loadGame();
    }
    return dm.director.replaceScene(dm.game, lime.transitions.Dissolve);
  };
  return dm.LDB.get('data', func, this);
};

dm.builtWithLime = function(scene) {};

/*
#
# 检查版本
*/

dm.checkVersion = function() {
  return dm.LDB.get('uuid', function(uuid) {
    var l;
    if (!uuid) {
      uuid = dm.LDB.lc().uuid();
      dm.olduser = true;
    }
    dm.uuid = uuid;
    dm.LDB.save('uuid', uuid);
    l = new dm.Loader();
    l.add({
      type: 'js',
      src: dm.SERVER + 'vc.php?uuid=' + uuid
    });
    l.itemLoad = function(succ) {
      var _VER;
      if (succ) {
        _VER = window._VER;
        return _VER && _VER.action();
      }
    };
    return l.load();
  });
};

dm.hidegame = function() {
  if (dm.ishide) return;
  dm.director && dm.director.setPaused(true);
  $('.lime-director').hide();
  return dm.ishide = true;
};

dm.showgame = function() {
  if (!dm.ishide) return;
  dm.director && dm.director.setPaused(false);
  $('.lime-director').show();
  return dm.ishide = false;
};

dm.checkLoginDiv = function() {
  var el;
  dm.hidegame();
  el = document.getElementById('');
  if (!el) {
    el = goog.dom.createDom('div', {
      "class": 'hidden',
      id: 'register'
    });
    el.innerHTML = "";
  }
  return $(el).show();
};

dm.continuegame = function() {
  $('.subpage').hide();
  $('.alert').hide();
  dm.showgame();
  return false;
};

dm.start = function() {
  var el, logdiv;
  el = document.getElementById('gamearea');
  el || (el = document.body);
  $('#loading').hide();
  logdiv = document.getElementById('log-wrapper');
  if (!logdiv && goog.DEBUG) {
    logdiv = goog.dom.createDom('div', {
      style: '\
						 position: absolute;\
						 width: 20%;\
						 right: 0%;\
						 height: 100%;\
						 top: 40px;\
						 overflow: auto;\
						 border: 1px solid #cccccc;',
      id: 'log-wrapper'
    });
    logdiv.innerHTML = "<button id='log-clear-btn' class='lime-button'\nstyle='width: 100%; height: 50px;  display: block;'\nonclick=\"dm.Log.clear()\">Clear</button>\n						 <div id='log-div' style='border: 1px solid #cccccc; overflow: auto;'></div>";
    goog.dom.appendChild(el, logdiv);
    goog.events.listen(document.getElementById('log-clear-btn'), ['click', 'touchstart'], dm.Log.clear);
  }
  /*
  	goog.debug.LogManager.getRoot().setLevel goog.debug.Logger.Level.ALL
  	dm.logconsole = new goog.debug.DivConsole document.getElementById 'log-div'
  	dm.logconsole.setCapturing true
  	# A helper function to handle events.
  	dm.handler4Event = (elementType)->
  		(e) ->
  			dm.log.info elementType + ' ' + e.type + '.'
  */
  if (goog.DEBUG) {
    dm.Log.init(document.getElementById('log-div'), 'fine');
  } else {
    dm.Log.init(null, 'fine');
  }
  dm.log = dm.Log;
  dm.director = new lime.Director(el, dm.WIDTH, dm.HEIGHT);
  dm.director.makeMobileWebAppCapable();
  dm.log.debug('width' + ' ' + el.clientWidth + ' ' + 'height' + ' ' + el.clientHeight + ' ' + 'offsetX' + ' ' + el.offsetLeft + ' ' + 'offsetY' + ' ' + el.offsetTop);
  goog.events.listen(goog.global, ['orientationchange', goog.events.EventType.RESIZE], function(e) {
    dm.log.debug('goog.global@orientationchange|RESIZE', e);
    return dm.log.debug('width' + ' ' + el.clientWidth + ' ' + 'height' + ' ' + el.clientHeight + ' ' + 'offsetX' + ' ' + el.offsetLeft + ' ' + 'offsetY' + ' ' + el.offsetTop);
  });
  dm.loadCover();
  return dm.checkVersion();
};

goog.exportSymbol('dm.start', dm.start);
