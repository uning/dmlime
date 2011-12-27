
goog.provide('dm');

goog.require('goog.events');

goog.require('goog.events.EventType');

goog.require('goog.debug.DivConsole');

goog.require('goog.dom');

goog.require('goog.dom.classes');

goog.require('goog.object');

goog.require('lime.Director');

goog.require('lime.GlossyButton');

goog.require('lime.Layer');

goog.require('lime.Scene');

goog.require('lime.transitions.Dissolve');

goog.require('dm.Board');

goog.require('dm.Button');

goog.require('dm.Game');

goog.require('dm.Help');

goog.require('dm.User');

goog.require('dm.Display');

dm.WIDTH = 720;

dm.HEIGHT = 1004;

dm.BOARDSIZE = 690;

dm.GEMTYPES = ['monster', 'blood', 'defend', 'sword', 'gold'];

dm.LVLCONF = [
  {
    gold: 1000,
    gold_add: 1,
    gold_ratio: 1,
    defense: 1000,
    hp: 30,
    attack: 3,
    wattack: 1,
    exp: 1000
  }, {
    gold: 1000,
    defense: 10000,
    hp: 30,
    attack: 3,
    wattack: 1
  }
];

dm.curdata = {
  gold: 0,
  defense: 0,
  lvl: 0,
  exp: 0,
  hp: 100,
  mhp: 0,
  mdfense: 0
};

dm.loadMenu = function() {
  var btn, btns, btns2, layer, lbl, move, scene;
  scene = new lime.Scene;
  layer = new lime.Layer().setPosition(dm.WIDTH / 2, 0);
  btns = new lime.Layer().setPosition(0, 0);
  layer.appendChild(btns);
  move = new lime.animation.MoveBy(-dm.WIDTH, 0).enableOptimizations();
  btn = dm.makeButton('开始').setPosition(0, 200);
  goog.events.listen(btn, 'click', function() {
    console.log('game start');
    return btns.runAction(move);
  });
  btns.appendChild(btn);
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
  btns2.appendChild(btn);
  btn = dm.makeButton('8x8').setPosition(0, 440);
  goog.events.listen(btn, 'click', function() {
    return dm.newgame(8);
  });
  btns2.appendChild(btn);
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
  dm.game = new dm.Game(size);
  return dm.director.replaceScene(dm.game, lime.transitions.Dissolve);
};

dm.loadHelpScene = function() {
  var scene;
  scene = new dm.Help;
  dm.builtWithLime(scene);
  return dm.director.replaceScene(scene, lime.transitions.Dissolve);
};

dm.builtWithLime = function(scene) {};

dm.start = function() {
  var el, logdiv;
  dm.log = goog.debug.Logger.getLogger('dm');
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.ALL);
  logdiv = document.getElementById('log-wrapper');
  logdiv || (logdiv = goog.dom.createDom('div', {
    style: '\
						 position: absolute;\
						 top: 40px;\
						 width: 30%;\
						 right: 0%;\
						 height: 100%;\
						 overflow: auto;\
						 border: 1px solid #cccccc;',
    id: 'log-wrapper'
  }));
  el = document.getElementById('gamearea');
  el || (el = document.body);
  logdiv.innerHTML = "<div id='clearlog' style='border: 1px solid #cccccc;'>		                 <a href='javascript:void dm.logconsole.clear()'>Clear Log</a>					 </div>	                 <div id='log-div' style='top: 40px;border: 1px solid #cccccc;'>					 </div>";
  goog.dom.appendChild(el, logdiv);
  dm.logconsole = new goog.debug.DivConsole(document.getElementById('log-div'));
  dm.logconsole.setCapturing(true);
  dm.handler4Event = function(elementType) {
    return function(e) {
      return dm.log.info(elementType + ' ' + e.type + '.');
    };
  };
  dm.log.fine('init');
  console.log('in dm.start', el);
  dm.director = new lime.Director(el, dm.WIDTH, dm.HEIGHT);
  dm.director.makeMobileWebAppCapable;
  return dm.loadMenu();
};

goog.exportSymbol('dm.start', dm.start);
